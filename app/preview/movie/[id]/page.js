import { tmdb } from "@/lib/tmdb";
import PreviewClient from "@/components/PreviewClient";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const movie = await tmdb(`/movie/${id}`).catch(() => null);
    if (!movie) return { title: "Not Found" };
    
    return {
        title: `${movie.title} — RAINE preview`,
        description: movie.overview,
    };
}

export default async function PreviewPage({ params }) {
    const { id } = await params;

    let movie = null;
    try {
        movie = await tmdb(`/movie/${id}`);
    } catch (e) {
        console.error("Failed to fetch movie details for preview", e);
    }

    if (!movie) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>
                <h2>Movie not found.</h2>
            </div>
        );
    }

    return <PreviewClient id={id} movie={movie} />;
}
