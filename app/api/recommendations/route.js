import { tmdb } from "@/lib/tmdb";

const MOVIE_PARAMS = {
    sort_by: "vote_average.desc",
    "vote_count.gte": "2000",
    with_genres: "18,878",
};

const TV_PARAMS = {
    sort_by: "vote_average.desc",
    "vote_count.gte": "1000",
    with_genres: "18,10765",
};

async function getCuratedFallback(type) {
    if (type === "movie") {
        const data = await tmdb("/discover/movie", MOVIE_PARAMS);
        return {
            ...data,
            results: (data.results || []).map((m) => ({ ...m, media_type: "movie" })),
        };
    }
    if (type === "tv") {
        const data = await tmdb("/discover/tv", TV_PARAMS);
        return {
            ...data,
            results: (data.results || []).map((s) => ({ ...s, media_type: "tv", title: s.name })),
        };
    }

    // Mixed curated fallback (both top-rated movies & top-rated TV)
    const [moviesRes, tvRes] = await Promise.allSettled([
        tmdb("/discover/movie", MOVIE_PARAMS),
        tmdb("/discover/tv", TV_PARAMS),
    ]);

    const movies = (moviesRes.status === "fulfilled" ? moviesRes.value?.results : []) || [];
    const tvShows = (tvRes.status === "fulfilled" ? tvRes.value?.results : []) || [];

    const taggedMovies = movies.map((m) => ({ ...m, media_type: "movie" }));
    const taggedTv = tvShows.map((s) => ({ ...s, media_type: "tv", title: s.name }));

    const mixed = [];
    const max = Math.max(taggedMovies.length, taggedTv.length);
    for (let i = 0; i < max; i++) {
        if (taggedMovies[i]) mixed.push(taggedMovies[i]);
        if (taggedTv[i]) mixed.push(taggedTv[i]);
    }

    return { results: mixed.slice(0, 20) };
}

export async function GET(request) {
    const searchParams = new URL(request.url).searchParams;
    const idsParam = searchParams.get("ids");
    const typeParam = searchParams.get("type"); // "tv" | "movie"

    if (!idsParam) {
        try {
            const data = await getCuratedFallback(typeParam);
            return Response.json(data, {
                headers: {
                    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
                },
            });
        } catch (err) {
            return Response.json({ error: err.message }, { status: 502 });
        }
    }

    const ids = idsParam.split(",").slice(0, 3).filter(Boolean);
    if (ids.length === 0) {
        try {
            const data = await getCuratedFallback(typeParam);
            return Response.json(data, {
                headers: {
                    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
                },
            });
        } catch (err) {
            return Response.json({ error: err.message }, { status: 502 });
        }
    }

    try {
        const fetchEndpoint = (id) => {
            if (typeParam === "tv") return `/tv/${id}/recommendations`;
            return `/movie/${id}/recommendations`;
        };

        const settled = await Promise.allSettled(
            ids.map((id) => tmdb(fetchEndpoint(id)))
        );

        const responses = [];
        for (let i = 0; i < settled.length; i++) {
            const res = settled[i];
            if (res.status === "fulfilled" && res.value) {
                responses.push(res.value);
            } else {
                console.warn(`Failed to fetch recommendations for ID ${ids[i]}:`, res.reason?.message || res.reason);
            }
        }

        if (responses.length === 0) {
            const fallback = await getCuratedFallback(typeParam);
            return Response.json(fallback, {
                headers: {
                    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
                },
            });
        }

        const lengths = responses.map((r) => (r.results || []).length);
        const maxLen = lengths.length > 0 ? Math.max(...lengths) : 0;

        if (maxLen === 0) {
            const fallback = await getCuratedFallback(typeParam);
            return Response.json(fallback, {
                headers: {
                    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
                },
            });
        }

        const merged = [];
        const seen = new Set();

        for (let i = 0; i < maxLen; i++) {
            for (const res of responses) {
                const item = res.results?.[i];
                if (item && !seen.has(item.id)) {
                    seen.add(item.id);
                    merged.push({
                        ...item,
                        media_type: item.media_type || (typeParam === "tv" || item.first_air_date ? "tv" : "movie"),
                        title: item.title || item.name,
                    });
                }
            }
        }

        return Response.json({ results: merged }, {
            headers: {
                "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
            },
        });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 502 });
    }
}
