import { tmdb } from "@/lib/tmdb";

export async function GET(request) {
    const idsParam = new URL(request.url).searchParams.get("ids");
    if (!idsParam) return Response.json({ error: "Missing ids." }, { status: 400 });

    const ids = idsParam.split(",").slice(0, 3).filter(Boolean);
    if (ids.length === 0) return Response.json({ results: [] });

    try {
        const responses = [];
        for (const id of ids) {
            responses.push(await tmdb(`/movie/${id}/recommendations`));
        }
        
        const merged = [];
        const seen = new Set();
        
        // Interleave recommendations for a balanced mix from the selected movies
        const maxLen = Math.max(...responses.map(r => (r.results || []).length));
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
