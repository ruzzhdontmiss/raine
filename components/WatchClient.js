"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VidyPlayer from "./VidyPlayer";

export default function WatchClient({ id, title, type, season = 1, episode = 1 }) {
    const router = useRouter();
    const [initialProgress, setInitialProgress] = useState(0);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const key = type === "movie" ? `progress-movie-${id}` : `progress-tv-${id}-${season}-${episode}`;
        try {
            const saved = localStorage.getItem(key);
            if (saved) setInitialProgress(parseFloat(saved));
        } catch (e) {
            // Ignore localStorage errors
        }
        setLoaded(true);
    }, [id, type, season, episode]);

    const handleTimeUpdate = (currentTime) => {
        const key = type === "movie" ? `progress-movie-${id}` : `progress-tv-${id}-${season}-${episode}`;
        try {
            localStorage.setItem(key, currentTime.toString());
        } catch (e) {
            // Ignore localStorage errors
        }
    };

    if (!loaded) return null;

    return (
        <div className="watch-page">
            <header className="watch-header">
                <button 
                    onClick={() => router.push("/")}
                    className="watch-back-btn"
                >
                    ← <span>Back to Browse</span>
                </button>
                <h1 className="watch-title">{title}</h1>
            </header>

            <main className="watch-main">
                <div className="watch-player-wrapper">
                    <VidyPlayer 
                        tmdbId={id}
                        type={type}
                        season={season}
                        episode={episode}
                        progress={initialProgress}
                        onTimeUpdate={handleTimeUpdate}
                    />
                </div>
            </main>
        </div>
    );
}
