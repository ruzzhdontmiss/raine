"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import VidyPlayer from "./VidyPlayer";

export default function TvWatchClient({
    show,
    season,
    episode,
    episodeData,
    prevEpisode,
    nextEpisode,
}) {
    const [initialProgress, setInitialProgress] = useState(0);
    const [sourceUnavailable, setSourceUnavailable] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const hasRecorded = useRef(false);

    const sNum = Number(season);
    const epNum = Number(episode);

    // Vidy iframe does not expose playback events; TV progress is tracked per-episode (binary), not in-episode. Movie progress via player events is unaffected.
    useEffect(() => {
        if (hasRecorded.current) return;
        hasRecorded.current = true;

        const key = `progress-tv-${show.id}-${sNum}-${epNum}`;
        try {
            const saved = localStorage.getItem(key);
            if (saved) setInitialProgress(parseFloat(saved));

            // Save immediately into continueWatching with extended schema
            const item = {
                type: "tv",
                id: show.id,
                name: show.name,
                title: show.name,
                poster: show.poster_path,
                poster_path: show.poster_path,
                season: sNum,
                episode: epNum,
                episodeName: episodeData?.name || `Episode ${epNum}`,
                progress: saved ? parseFloat(saved) : 0,
                timestamp: Date.now(),
            };

            const cw = JSON.parse(localStorage.getItem("continueWatching")) || [];
            const filtered = cw.filter((m) => !(m.id === show.id && (m.type === "tv" || !m.type)));
            const updated = [item, ...filtered].slice(0, 10);
            localStorage.setItem("continueWatching", JSON.stringify(updated));
        } catch (e) {}
    }, [show.id, show.name, show.poster_path, sNum, epNum, episodeData?.name]);

    useEffect(() => {
        let timeout;
        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setShowControls(false), 3500);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            clearTimeout(timeout);
        };
    }, []);

    const handleTimeUpdate = (currentTime) => {
        const key = `progress-tv-${show.id}-${sNum}-${epNum}`;
        try {
            localStorage.setItem(key, currentTime.toString());

            const cw = JSON.parse(localStorage.getItem("continueWatching")) || [];
            const existingIndex = cw.findIndex((m) => m.id === show.id && m.type === "tv");
            if (existingIndex >= 0) {
                cw[existingIndex].progress = currentTime;
                cw[existingIndex].timestamp = Date.now();
                localStorage.setItem("continueWatching", JSON.stringify(cw));
            }
        } catch (e) {}
    };

    const title = `${show.name} · S${sNum}E${epNum} ${episodeData?.name ? `“${episodeData.name}”` : ""}`;

    return (
        <div className="watch-page">
            <header className={`watch-header ${showControls ? "" : "hidden"}`}>
                <div className="watch-nav-left">
                    <Link href={`/preview/tv/${show.id}`} className="watch-back-btn">
                        ← <span>Back to Show</span>
                    </Link>
                    <span className="watch-divider">/</span>
                    <span className="watch-title">{title}</span>
                </div>

                <div className="watch-nav-right">
                    {prevEpisode ? (
                        <Link
                            href={`/watch/tv/${show.id}/${sNum}/${prevEpisode.episode_number}`}
                            className="watch-ep-nav-btn"
                            title={`Previous: E${prevEpisode.episode_number} ${prevEpisode.name}`}
                        >
                            ⏮ Prev
                        </Link>
                    ) : (
                        <span className="watch-ep-nav-btn disabled">⏮ Prev</span>
                    )}

                    {nextEpisode ? (
                        <Link
                            href={`/watch/tv/${show.id}/${sNum}/${nextEpisode.episode_number}`}
                            className="watch-ep-nav-btn"
                            title={`Next: E${nextEpisode.episode_number} ${nextEpisode.name}`}
                        >
                            Next ⏭
                        </Link>
                    ) : (
                        <span className="watch-ep-nav-btn disabled">Next ⏭</span>
                    )}
                </div>
            </header>

            <main className="watch-main">
                {sourceUnavailable ? (
                    <div className="source-unavailable">
                        <div className="source-unavailable-card">
                            <h3>Source unavailable for this episode</h3>
                            <p>No video stream could be reached for S{sNum}E{epNum}.</p>
                            <div className="source-actions">
                                <button onClick={() => setSourceUnavailable(false)} className="btn-secondary">
                                    Retry Player
                                </button>
                                <Link href={`/preview/tv/${show.id}`} className="btn-play">
                                    View All Episodes
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="watch-player-wrapper">
                        <VidyPlayer
                            tmdbId={show.id}
                            type="tv"
                            season={sNum}
                            episode={epNum}
                            progress={initialProgress}
                            onTimeUpdate={handleTimeUpdate}
                            onFallback={() => setSourceUnavailable(true)}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
