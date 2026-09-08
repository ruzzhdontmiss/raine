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
    onTimeUpdate,
    onEnded,
    onPlay,
    onPause,
    onFallback,
}) {
    const [useFallback, setUseFallback] = useState(false);

    useEffect(() => {
        if (useFallback) {
            onFallback?.();
            return;
        }

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
    }, [useFallback, onTimeUpdate, onEnded, onPlay, onPause, onFallback]);

    if (!tmdbId) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", color: "rgba(255,255,255,0.5)" }}>
                Content unavailable
            </div>
        );
    }

    if (useFallback) {
        return (
            <video
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                controls
                autoPlay
                controlsList="nodownload"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onTimeUpdate={(e) => onTimeUpdate?.(e.target.currentTime, e.target.duration)}
                onEnded={onEnded}
                onPlay={onPlay}
                onPause={onPause}
            />
        );
    }

    let src = type === "movie" 
        ? `https://vidy.st/movie/${tmdbId}?color=${color}&progress=${progress}` 
        : `https://vidy.st/tv/${tmdbId}/${season}/${episode}?color=${color}&progress=${progress}&nextEpisode=${nextEpisode}&episodeSelector=${episodeSelector}&autoplayNextEpisode=${autoplayNextEpisode}`;

    return (
        <iframe
            src={src}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            allow="encrypted-media; autoplay; fullscreen; picture-in-picture; web-share"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={() => setUseFallback(true)}
        ></iframe>
    );
}
