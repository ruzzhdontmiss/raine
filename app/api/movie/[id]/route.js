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
        const data = await tmdb(`/movie/${id}`);
        return NextResponse.json(data);
    } catch (err) {
        console.error("Movie route error:", err);
        const status = err.status === 404 ? 404 : 502;
        const msg = err.status === 404 ? "Movie not found" : "Request failed";
        return NextResponse.json({ error: msg }, { status });
    }
}
