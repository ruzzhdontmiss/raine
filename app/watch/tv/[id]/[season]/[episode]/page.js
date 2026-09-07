"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import VidyPlayer from "@/components/VidyPlayer";

export default function TVWatchPage({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { id, season, episode } = resolvedParams;

    const [showData, setShowData] = useState(null);
    const [initialProgress, setInitialProgress] = useState(0);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Fetch show details for the title
        fetch(`/api/tv/${id}`)
            .then((res) => res.json())
            .then((data) => setShowData(data))
            .catch((err) => console.error("Failed to fetch tv details", err));

        // Load progress
        const key = `progress-tv-${id}-${season}-${episode}`;
        try {
            const saved = localStorage.getItem(key);
            if (saved) setInitialProgress(parseFloat(saved));
        } catch (e) {
            // Ignore errors
        }
        setLoaded(true);
    }, [id, season, episode]);

    const handleTimeUpdate = (currentTime) => {
        const key = `progress-tv-${id}-${season}-${episode}`;
        try {
            localStorage.setItem(key, currentTime.toString());
        } catch (e) {
            // Ignore errors
        }
    };

    if (!loaded) return null;

    const title = showData ? `${showData.name} - S${season}E${episode}` : "TV Viewer";

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
                        type="tv"
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
