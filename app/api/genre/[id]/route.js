import { tmdb } from "@/lib/tmdb";

// Distinct TMDB genre mappings for movie vs TV
const MOVIE_TO_TV_GENRES = {
    "18": "18",       // Drama
    "878": "10765",   // Sci-Fi -> Sci-Fi & Fantasy
    "53": "80",       // Thriller -> Crime (TMDB TV has no 53; 80 is Crime/Thriller)
    "28": "10759",    // Action -> Action & Adventure
    "16": "16",       // Animation
};

const TV_TO_MOVIE_GENRES = {
    "18": "18",       // Drama
    "10765": "878",   // Sci-Fi
    "80": "53",       // Crime/Thriller -> Thriller
    "10759": "28",    // Action & Adventure -> Action
    "16": "16",       // Animation
};

export async function GET(request, { params }) {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    try {
        if (type === "tv") {
            const tvGenreId = MOVIE_TO_TV_GENRES[id] || id;
            const data = await tmdb("/discover/tv", {
                with_genres: tvGenreId,
                sort_by: "popularity.desc",
            });
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
            const movieGenreId = TV_TO_MOVIE_GENRES[id] || id;
            const data = await tmdb("/discover/movie", {
                with_genres: movieGenreId,
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
        }

        // type === "all" or omitted: fetch both movie and TV for this genre and interleave
        const movieGenreId = TV_TO_MOVIE_GENRES[id] || id;
        const tvGenreId = MOVIE_TO_TV_GENRES[id] || id;

        const [movieData, tvData] = await Promise.all([
            tmdb("/discover/movie", { with_genres: movieGenreId, sort_by: "popularity.desc" }),
            tmdb("/discover/tv", { with_genres: tvGenreId, sort_by: "popularity.desc" }),
        ]);

        const movies = (movieData.results || []).map((m) => ({ ...m, media_type: "movie" }));
        const tv = (tvData.results || []).map((s) => ({ ...s, media_type: "tv", title: s.name || s.title }));
        const interleaved = [];
        const maxLen = Math.max(movies.length, tv.length);
        for (let i = 0; i < maxLen; i++) {
            if (i < movies.length) interleaved.push(movies[i]);
            if (i < tv.length) interleaved.push(tv[i]);
        }

        return Response.json({ ...movieData, results: interleaved }, {
            headers: {
                "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
            },
        });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 502 });
    }
}
