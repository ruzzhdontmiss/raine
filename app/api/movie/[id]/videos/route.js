import { tmdb } from "@/lib/tmdb";
import { checkRateLimit } from "@/lib/rateLimit";
import { isValidId } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const rl = checkRateLimit(request, "movie");
    if (!rl.allowed) return rl.response;

    const { id } = await params;
    if (!isValidId(id)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    try {
        const data = await tmdb(`/movie/${id}/videos`);
        return NextResponse.json(data);
    } catch (err) {
        console.error("Movie videos route error:", err);
        return NextResponse.json({ error: "Request failed" }, { status: 502 });
    }
}
