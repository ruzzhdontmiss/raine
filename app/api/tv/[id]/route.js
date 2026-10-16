import { tmdb } from "@/lib/tmdb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { id } = await params;
    
    try {
        const data = await tmdb(`/tv/${id}`, {
            append_to_response: "aggregate_credits,videos,images,recommendations,content_ratings",
            include_image_language: "en,null",
        });
        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
            },
        });
    } catch (err) {
        const status = err.status || 502;
        return NextResponse.json(
            { error: err.message || "TV show not found" },
            { status }
        );
    }
}
