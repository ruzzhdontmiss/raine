import { tmdb } from "@/lib/tmdb";

export async function GET(request) {
    const q = (new URL(request.url).searchParams.get("q") || "").trim();
    if (!q) return Response.json({ error: "Missing query." }, { status: 400 });

    try {
        const data = await tmdb("/search/multi", { query: q, include_adult: "false" });
        const filtered = (data.results || []).filter(
            (item) => item.media_type === "movie" || item.media_type === "tv"
        );
        return Response.json({
            ...data,
            results: filtered,
        }, {
            headers: {
                "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
            },
        });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 502 });
    }
}
