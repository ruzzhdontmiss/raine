import { tmdb } from "@/lib/tmdb";
import TvPreviewClient from "@/components/TvPreviewClient";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const show = await tmdb(`/tv/${id}`).catch(() => null);
    if (!show) return { title: "Not Found — RAINE" };
    
    const title = `${show.name} — RAINE`;
    const description = (show.overview || "Watch calmly on RAINE.").slice(0, 160);
    const imagePath = show.backdrop_path || show.poster_path;
    const imageUrl = imagePath ? `https://image.tmdb.org/t/p/w780${imagePath}` : null;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "video.tv_show",
            ...(imageUrl ? { images: [{ url: imageUrl, width: 780, height: 439, alt: show.name }] } : {}),
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            ...(imageUrl ? { images: [imageUrl] } : {}),
        },
    };
}

export default async function TvPreviewPage({ params }) {
    const { id } = await params;

    let show = null;
    try {
        show = await tmdb(`/tv/${id}`, {
            append_to_response: "aggregate_credits,videos,images,recommendations,content_ratings",
            include_image_language: "en,null",
        });
    } catch (e) {
        console.error("Failed to fetch tv details for preview", e);
    }

    if (!show) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>
                <h2>TV show not found.</h2>
            </div>
        );
    }

    return <TvPreviewClient id={id} show={show} />;
}
