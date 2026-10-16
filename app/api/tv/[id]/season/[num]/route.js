import { tmdb } from "@/lib/tmdb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { id, num } = await params;

    try {
        const data = await tmdb(`/tv/${id}/season/${num}`, {
            append_to_response: "videos",
        });
        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
            },
        });
    } catch (err) {
        const status = err.status || 502;
        return NextResponse.json(
            { error: err.message || "Season details not found" },
            { status }
        );
    }
}
