import { tmdb } from "@/lib/tmdb";
import TvWatchClient from "@/components/TvWatchClient";

export async function generateMetadata({ params }) {
    const { id, season, episode } = await params;
    try {
        const show = await tmdb(`/tv/${id}`);
        return {
            title: `${show.name} S${season}E${episode} — RAINE`,
            description: `Watch ${show.name} Season ${season} Episode ${episode} calmly.`,
        };
    } catch {
        return { title: "Watch TV — RAINE" };
    }
}

export default async function TVWatchPage({ params }) {
    const { id, season, episode } = await params;

    let show = null;
    let seasonData = null;

    try {
        const [showRes, seasonRes] = await Promise.all([
            tmdb(`/tv/${id}`),
            tmdb(`/tv/${id}/season/${season}`),
        ]);
        show = showRes;
        seasonData = seasonRes;
    } catch (err) {
        console.error("Failed to load TV watch data", err);
    }

    if (!show) {
        return (
            <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", color: "var(--ink)" }}>
                <h2>TV show not found.</h2>
            </div>
        );
    }

    const sNum = parseInt(season, 10);
    const epNum = parseInt(episode, 10);
    const episodes = seasonData?.episodes || [];
    const currentIndex = episodes.findIndex((e) => e.episode_number === epNum);
    const currentEpisode = currentIndex >= 0 ? episodes[currentIndex] : { episode_number: epNum, name: `Episode ${epNum}` };
    const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
    const nextEpisode = currentIndex >= 0 && currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

    return (
        <TvWatchClient
            show={show}
            season={sNum}
            episode={epNum}
            episodeData={currentEpisode}
            prevEpisode={prevEpisode}
            nextEpisode={nextEpisode}
        />
    );
}
