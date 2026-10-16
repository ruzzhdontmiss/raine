import { tmdb } from "@/lib/tmdb";
import { checkRateLimit } from "@/lib/rateLimit";
import { isValidId, isValidSeasonNum } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const rl = checkRateLimit(request, "tv");
    if (!rl.allowed) return rl.response;

    const { id, num } = await params;
    if (!isValidId(id)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    if (!isValidSeasonNum(num)) {
        return NextResponse.json({ error: "Invalid season number (1-100)" }, { status: 400 });
    }

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
        console.error("Season details route error:", err);
        const status = err.status === 404 ? 404 : 502;
        const msg = err.status === 404 ? "Season details not found" : "Request failed";
        return NextResponse.json({ error: msg }, { status });
    }
}
