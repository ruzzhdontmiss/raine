import { tmdb } from "@/lib/tmdb";

export async function GET() {
    try {
        const data = await tmdb("/movie/popular");
        return Response.json(data);
    } catch (err) {
        return Response.json({ error: err.message }, { status: 502 });
    }
}
