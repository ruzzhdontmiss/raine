import { tmdb } from "@/lib/tmdb";
import WatchClient from "@/components/WatchClient";

export default async function MovieWatchPage({ params }) {
    // Next.js 15 requires awaiting params
    const { id } = await params;

    let movie = null;
    try {
        movie = await tmdb(`/movie/${id}`);
    } catch (e) {
        // If TMDB fetch fails, we still render the player but with a generic title
        console.error("Failed to fetch movie details", e);
    }

    return (
        <WatchClient 
            id={id} 
            title={movie?.title || "Movie Viewer"} 
            type="movie" 
        />
    );
}
