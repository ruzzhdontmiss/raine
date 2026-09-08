import { tmdb } from "@/lib/tmdb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const data = await tmdb(`/movie/${id}/recommendations`);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
    }
}
