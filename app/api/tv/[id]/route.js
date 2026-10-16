import { tmdb } from "@/lib/tmdb";
import { checkRateLimit } from "@/lib/rateLimit";
import { isValidId } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const rl = checkRateLimit(request, "tv");
    if (!rl.allowed) return rl.response;

    const { id } = await params;
    if (!isValidId(id)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

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
        console.error("TV details route error:", err);
        const status = err.status === 404 ? 404 : 502;
        const msg = err.status === 404 ? "TV show not found" : "Request failed";
        return NextResponse.json({ error: msg }, { status });
    }
}
