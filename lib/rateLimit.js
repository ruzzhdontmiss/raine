/**
 * In-memory per-IP rate limiter for RAINE API routes.
 *
 * Limitation note: In-memory limits reset per serverless instance;
 * acceptable for this scale and provides lightweight burst protection.
 */

// Map of routeFamily:clientIp -> array of timestamps (ms)
const rateLimitMap = new Map();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60;      // 60 requests per minute per route family

export function checkRateLimit(request, routeFamily = "default") {
    // Determine client IP from standard proxy headers or fallback
    const forwardedFor = request?.headers?.get?.("x-forwarded-for");
    const realIp = request?.headers?.get?.("x-real-ip");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : (realIp || "127.0.0.1");

    const key = `${routeFamily}:${ip}`;
    const now = Date.now();
    const windowStart = now - WINDOW_MS;

    const timestamps = rateLimitMap.get(key) || [];
    // Keep only timestamps within the current window
    const recent = timestamps.filter((t) => t > windowStart);

    if (recent.length >= MAX_REQUESTS) {
        return {
            allowed: false,
            response: Response.json(
                { error: "Too many requests. Please slow down." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": "60",
                    },
                }
            ),
        };
    }

    recent.push(now);
    rateLimitMap.set(key, recent);

    // Periodically prune stale keys to keep memory bounded
    if (rateLimitMap.size > 500) {
        for (const [k, ts] of rateLimitMap.entries()) {
            if (!ts.some((t) => t > windowStart)) {
                rateLimitMap.delete(k);
            }
        }
    }

    return { allowed: true };
}
