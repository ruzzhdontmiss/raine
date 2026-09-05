import { tmdb } from "@/lib/tmdb";

export async function GET(request, { params }) {
    const { id } = await params; // params is a Promise in modern Next.js
    try {
        const data = await tmdb("/discover/movie", {
            with_genres: id,
            sort_by: "popularity.desc",
        });
        return Response.json(data);
    } catch (err) {
        return Response.json({ error: err.message }, { status: 502 });
    }
}
