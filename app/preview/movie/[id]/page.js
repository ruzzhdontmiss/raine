import { tmdb } from "@/lib/tmdb";
import PreviewClient from "@/components/PreviewClient";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const movie = await tmdb(`/movie/${id}`).catch(() => null);
    if (!movie) return { title: "Not Found — RAINE" };
    
    const title = `${movie.title} — RAINE`;
    const description = (movie.overview || "Watch calmly on RAINE.").slice(0, 160);
    const imagePath = movie.backdrop_path || movie.poster_path;
    const imageUrl = imagePath ? `https://image.tmdb.org/t/p/w780${imagePath}` : null;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "video.movie",
            ...(imageUrl ? { images: [{ url: imageUrl, width: 780, height: 439, alt: movie.title }] } : {}),
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            ...(imageUrl ? { images: [imageUrl] } : {}),
        },
    };
}

export default async function PreviewPage({ params }) {
    const { id } = await params;

    let movie = null;
    try {
        movie = await tmdb(`/movie/${id}`, {
            append_to_response: "images,videos,credits,recommendations",
            include_image_language: "en,null",
        });
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
