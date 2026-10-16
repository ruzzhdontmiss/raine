import { tmdb } from "@/lib/tmdb";
import { checkRateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";

export async function GET(request) {
    const rl = checkRateLimit(request, "tv");
    if (!rl.allowed) return rl.response;

    try {
        const data = await tmdb("/trending/tv/week");
        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
            },
        });
    } catch (err) {
        console.error("TV popular route error:", err);
        return NextResponse.json({ error: "Request failed" }, { status: 502 });
    }
}
