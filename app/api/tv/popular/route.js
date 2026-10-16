import { tmdb } from "@/lib/tmdb";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const data = await tmdb("/trending/tv/week");
        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
            },
        });
    } catch (err) {
        const status = err.status || 502;
        return NextResponse.json(
            { error: err.message || "Failed to fetch popular TV shows" },
            { status }
        );
    }
}
