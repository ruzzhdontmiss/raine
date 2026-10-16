import { tmdb } from "@/lib/tmdb";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    try {
        if (type === "tv") {
            const data = await tmdb("/tv/popular");
            const tagged = (data.results || []).map((s) => ({
                ...s,
                media_type: "tv",
                title: s.name || s.title,
            }));
            return Response.json({ ...data, results: tagged }, {
                headers: {
                    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
                },
            });
        }

        if (type === "movie") {
            const data = await tmdb("/movie/popular");
            const tagged = (data.results || []).map((m) => ({
                ...m,
                media_type: "movie",
            }));
            return Response.json({ ...data, results: tagged }, {
                headers: {
                    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
                },
            });
        }

        // type === "all" or omitted: fetch both and interleave with exact media tags
        const [moviesData, tvData] = await Promise.all([
            tmdb("/movie/popular"),
            tmdb("/tv/popular"),
        ]);
        const movies = (moviesData.results || []).map((m) => ({ ...m, media_type: "movie" }));
        const tv = (tvData.results || []).map((s) => ({ ...s, media_type: "tv", title: s.name || s.title }));
        const interleaved = [];
        const maxLen = Math.max(movies.length, tv.length);
        for (let i = 0; i < maxLen; i++) {
            if (i < movies.length) interleaved.push(movies[i]);
            if (i < tv.length) interleaved.push(tv[i]);
        }
        return Response.json({ ...moviesData, results: interleaved }, {
            headers: {
                "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
            },
        });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 502 });
    }
}
