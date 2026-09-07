import { tmdb } from "@/lib/tmdb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { id } = await params;
    
    try {
        const data = await tmdb(`/movie/${id}`);
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }
}
