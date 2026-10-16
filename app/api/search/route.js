import { tmdb } from "@/lib/tmdb";
import { checkRateLimit } from "@/lib/rateLimit";
import { sanitizeSearchQuery } from "@/lib/validation";

export async function GET(request) {
    const rl = checkRateLimit(request, "search");
    if (!rl.allowed) return rl.response;

    const rawQ = new URL(request.url).searchParams.get("q") || "";
    if (rawQ.trim().length > 100) {
        return Response.json({ error: "Query exceeds maximum length of 100 characters" }, { status: 400 });
    }
    const q = sanitizeSearchQuery(rawQ);
    if (!q) {
        return Response.json({ error: "Missing query" }, { status: 400 });
    }

    try {
        const data = await tmdb("/search/multi", { query: q, include_adult: "false" });
        const filtered = (data.results || []).filter(
            (item) => item.media_type === "movie" || item.media_type === "tv"
        );
        return Response.json({
            ...data,
            results: filtered,
        }, {
            headers: {
                "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
            },
        });
    } catch (err) {
        console.error("Search route error:", err);
        return Response.json({ error: "Request failed" }, { status: 502 });
    }
}
