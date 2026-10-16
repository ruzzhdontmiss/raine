import { tmdb } from "@/lib/tmdb";

export async function GET() {
    try {
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
    } catch (err) {
        return Response.json({ error: err.message }, { status: 502 });
    }
}
