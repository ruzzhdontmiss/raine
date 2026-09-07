import { tmdb } from "@/lib/tmdb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { id } = await params;
    
    try {
        const data = await tmdb(`/tv/${id}`);
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: "TV show not found" }, { status: 404 });
    }
}
