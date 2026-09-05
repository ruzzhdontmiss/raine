import { tmdb } from "@/lib/tmdb";

export async function GET(request) {
    const q = (new URL(request.url).searchParams.get("q") || "").trim();
    if (!q) return Response.json({ error: "Missing query." }, { status: 400 });

    try {
        const data = await tmdb("/search/movie", { query: q, include_adult: "false" });
        return Response.json(data);
    } catch (err) {
        return Response.json({ error: err.message }, { status: 502 });
    }
}
