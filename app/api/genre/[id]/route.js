import { tmdb } from "@/lib/tmdb";

const TV_GENRE_MAP = {
    "878": "10765", // Sci-Fi -> Sci-Fi & Fantasy
    "28": "10759",  // Action -> Action & Adventure
};

export async function GET(request, { params }) {
    const { id } = await params;
    const type = new URL(request.url).searchParams.get("type");

    try {
        if (type === "tv") {
            const tvGenreId = TV_GENRE_MAP[id] || id;
            const data = await tmdb("/discover/tv", {
                with_genres: tvGenreId,
                sort_by: "popularity.desc",
            });
            const tagged = (data.results || []).map((s) => ({
                ...s,
                media_type: "tv",
                title: s.name,
            }));
            return Response.json({ ...data, results: tagged }, {
                headers: {
                    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
                },
            });
        }

        const data = await tmdb("/discover/movie", {
            with_genres: id,
            sort_by: "popularity.desc",
        });
        const tagged = (data.results || []).map((m) => ({
            ...m,
            media_type: "movie",
        }));
        return Response.json({ ...data, results: tagged }, {
            headers: {
                "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
            },
        });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 502 });
    }
}
