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
    const [isFullscreen, setIsFullscreen] = useState(false);
    const hasRecorded = useRef(false);
    const playerFrameRef = useRef(null);

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

    const toggleFullscreen = () => {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        } else {
            const el = playerFrameRef.current;
            if (el) {
                if (el.requestFullscreen) {
                    el.requestFullscreen().catch(() => {});
                } else if (el.webkitRequestFullscreen) {
                    el.webkitRequestFullscreen();
                } else if (el.msRequestFullscreen) {
                    el.msRequestFullscreen();
                }
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

        const handleKeyDown = (e) => {
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
            if (e.key === "f" || e.key === "F") {
                e.preventDefault();
                toggleFullscreen();
            }
        };
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
            window.removeEventListener("keydown", handleKeyDown);
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

    const epDetails = episodeData?.name ? `S${sNum} E${epNum} · ${episodeData.name}` : `S${sNum} E${epNum}`;

    return (
        <div className="watch-page">
            <div className="watch-container">
                {/* 1. Header bar: single row, properly spaced */}
                <header className="watch-header">
                    <div className="watch-header-left">
                        <Link href={`/preview/tv/${show.id}`} className="watch-back-link">
                            ← <span>Back to Show</span>
                        </Link>
                        <div className="watch-title-group">
                            <span className="watch-show-title">{show.name}</span>
                            <span className="watch-ep-subtitle">{epDetails}</span>
                        </div>
                    </div>
                    <div className="watch-header-meta">
                        <span className="watch-badge">1080p HD</span>
                        <span className="watch-badge">Audio &amp; Subtitles</span>
                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="watch-badge watch-header-fs"
                            title={isFullscreen ? "Exit Fullscreen (f)" : "Fullscreen (f)"}
                            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                            {isFullscreen ? "⊽ Exit" : "⊼ Fullscreen"}
                        </button>
                    </div>
                </header>

                {/* 2 & 3. Player section with 24px gap and contained 16/9 player frame */}
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
                        <div className="watch-player-frame" ref={playerFrameRef}>
                            <VidyPlayer
                                tmdbId={show.id}
                                type="tv"
                                season={sNum}
                                episode={epNum}
                                progress={initialProgress}
                                onTimeUpdate={handleTimeUpdate}
                                onFallback={() => setSourceUnavailable(true)}
                            />
                            {isFullscreen && (
                                <button
                                    type="button"
                                    onClick={toggleFullscreen}
                                    className="watch-fs-exit-floating"
                                    title="Exit Fullscreen (Esc or f)"
                                    aria-label="Exit Fullscreen"
                                >
                                    ⊽ Exit Fullscreen
                                </button>
                            )}
                        </div>
                    )}

                    {/* 4. Below the player: control row with [← Back to Show], [⏮ Prev], [Next ⏭], [⊼ Fullscreen] */}
                    <div className="watch-controls-row">
                        <Link href={`/preview/tv/${show.id}`} className="watch-pill-btn">
                            ← Back to Show
                        </Link>
                        <div className="watch-nav-pills">
                            {prevEpisode ? (
                                <Link
                                    href={`/watch/tv/${show.id}/${sNum}/${prevEpisode.episode_number}`}
                                    className="watch-pill-btn"
                                    title={`Previous: E${prevEpisode.episode_number} ${prevEpisode.name}`}
                                >
                                    ⏮ Prev
                                </Link>
                            ) : (
                                <span className="watch-pill-btn disabled">⏮ Prev</span>
                            )}

                            {nextEpisode ? (
                                <Link
                                    href={`/watch/tv/${show.id}/${sNum}/${nextEpisode.episode_number}`}
                                    className="watch-pill-btn"
                                    title={`Next: E${nextEpisode.episode_number} ${nextEpisode.name}`}
                                >
                                    Next ⏭
                                </Link>
                            ) : (
                                <span className="watch-pill-btn disabled">Next ⏭</span>
                            )}

                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                className="watch-pill-btn watch-fs-pill"
                                title={isFullscreen ? "Exit Fullscreen (f)" : "Fullscreen (f)"}
                                aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                            >
                                {isFullscreen ? "⊽ Exit" : "⊼ Fullscreen"}
                            </button>
                        </div>
                    </div>

                    {/* 5. Meta row under the player */}
                    <div className="watch-meta-row">
                        <span className="watch-meta-item">Stream: Vidy Multi-Source</span>
                        <span className="watch-meta-dot">•</span>
                        <span className="watch-meta-item">Subtitles &amp; Audio available in player</span>
                        <span className="watch-meta-dot">•</span>
                        <span className="watch-meta-item">Season {sNum}, Episode {epNum}</span>
                    </div>
                </main>
            </div>
        </div>
    );
}
