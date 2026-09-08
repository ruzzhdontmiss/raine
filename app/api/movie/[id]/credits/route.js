import { tmdb } from "@/lib/tmdb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const data = await tmdb(`/movie/${id}/credits`);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 });
    }
}
