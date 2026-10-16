import { tmdb } from "@/lib/tmdb";

const CURATED_PARAMS = {
    sort_by: "vote_average.desc",
    "vote_count.gte": "2000",
    with_genres: "18,878",
};

export async function GET(request) {
    const idsParam = new URL(request.url).searchParams.get("ids");
    if (!idsParam) {
        try {
            const data = await tmdb("/discover/movie", CURATED_PARAMS);
            return Response.json(data);
        } catch (err) {
            return Response.json({ error: err.message }, { status: 502 });
        }
    }

    const ids = idsParam.split(",").slice(0, 3).filter(Boolean);
    if (ids.length === 0) {
        try {
            const data = await tmdb("/discover/movie", CURATED_PARAMS);
            return Response.json(data);
        } catch (err) {
            return Response.json({ error: err.message }, { status: 502 });
        }
    }

    try {
        const settled = await Promise.allSettled(
            ids.map((id) => tmdb(`/movie/${id}/recommendations`))
        );

        const responses = [];
        for (let i = 0; i < settled.length; i++) {
            const res = settled[i];
            if (res.status === "fulfilled" && res.value) {
                responses.push(res.value);
            } else {
                console.warn(`Failed to fetch recommendations for movie ID ${ids[i]}:`, res.reason?.message || res.reason);
            }
        }

        if (responses.length === 0) {
            const fallback = await tmdb("/discover/movie", CURATED_PARAMS);
            return Response.json(fallback);
        }

        const lengths = responses.map((r) => (r.results || []).length);
        const maxLen = lengths.length > 0 ? Math.max(...lengths) : 0;

        if (maxLen === 0) {
            const fallback = await tmdb("/discover/movie", CURATED_PARAMS);
            return Response.json(fallback);
        }

        const merged = [];
        const seen = new Set();

        // Interleave recommendations for a balanced mix from the selected movies
        for (let i = 0; i < maxLen; i++) {
            for (const res of responses) {
                const movie = res.results?.[i];
                if (movie && !seen.has(movie.id)) {
                    seen.add(movie.id);
                    merged.push(movie);
                }
            }
        }

        return Response.json({ results: merged });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 502 });
    }
}
