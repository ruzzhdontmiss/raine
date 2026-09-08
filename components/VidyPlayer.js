"use client";

import { useEffect, useState } from "react";

export default function VidyPlayer({
    tmdbId,
    type = "movie",
    season = 1,
    episode = 1,
    color = "7fb3d5",
    progress = 0,
    nextEpisode = false,
    episodeSelector = false,
    autoplayNextEpisode = false,
    title,
    onTimeUpdate,
    onEnded,
    onPlay,
    onPause,
}) {
    const [useFallback, setUseFallback] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", onFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
    }, []);

    useEffect(() => {
        if (useFallback) return;

        const handleMessage = (event) => {
            if (typeof event.data !== "string") return;

            let payload;
            try {
                payload = JSON.parse(event.data);
            } catch (e) {
                return;
            }

            if (payload.event === "timeupdate" && onTimeUpdate) {
                onTimeUpdate(payload.currentTime, payload.duration);
            } else if (payload.event === "ended" && onEnded) {
                onEnded();
            } else if (payload.event === "play" && onPlay) {
                onPlay();
            } else if (payload.event === "pause" && onPause) {
                onPause();
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [useFallback, onTimeUpdate, onEnded, onPlay, onPause]);

    if (!tmdbId) {
        return (
            <div className="vidy-wrapper">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", color: "var(--ink-soft)" }}>
                    Content unavailable
                </div>
            </div>
        );
    }

    let src = "";
    if (type === "movie") {
        src = `https://vidy.st/movie/${tmdbId}?color=${color}&progress=${progress}`;
    } else if (type === "tv") {
        src = `https://vidy.st/tv/${tmdbId}/${season}/${episode}?color=${color}&progress=${progress}&nextEpisode=${nextEpisode}&episodeSelector=${episodeSelector}&autoplayNextEpisode=${autoplayNextEpisode}`;
    }

    return (
        <div className={`vidy-wrapper ${isFullscreen ? "fullscreen" : ""}`}>
            {useFallback && (
                <div style={{ position: "absolute", bottom: "1rem", left: "1rem", fontSize: "12px", opacity: 0.5, zIndex: 10 }}>
                    ⚡
                </div>
            )}

            {useFallback ? (
                <video
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                    controls
                    autoPlay
                    controlsList="nodownload"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onTimeUpdate={(e) => onTimeUpdate?.(e.target.currentTime, e.target.duration)}
                    onEnded={onEnded}
                    onPlay={onPlay}
                    onPause={onPause}
                />
            ) : (
                <iframe
                    src={src}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen
                    allow="encrypted-media; autoplay; fullscreen; picture-in-picture; web-share"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={() => setUseFallback(true)}
                ></iframe>
            )}
        </div>
    );
}
