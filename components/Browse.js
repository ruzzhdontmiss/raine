"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TypingHero from "./TypingHero";
import MovieCard from "./MovieCard";

const MEDIA_FILTERS = [
    { key: "all", label: "All" },
    { key: "movie", label: "Movies" },
    { key: "tv", label: "TV" },
];

const GENRES = [
    { key: "all", label: "All" },
    { key: "18", label: "Drama" },
    { key: "878", label: "Sci-Fi" },
    { key: "53", label: "Thriller" },
    { key: "28", label: "Action" },
    { key: "16", label: "Animation" },
    { key: "recommendations", label: "For You" },
    { key: "my-list", label: "My List" },
];

export default function Browse({ initialMovies }) {
    const router = useRouter();
    const [movies, setMovies] = useState(initialMovies);
    const [mediaFilter, setMediaFilter] = useState("all");
    const [genre, setGenre] = useState("all");
    const [query, setQuery] = useState("");
    const [failed, setFailed] = useState(false);
    const [myList, setMyList] = useState([]);
    const [continueWatching, setContinueWatching] = useState([]);
    const firstRender = useRef(true);

    useEffect(() => {
        try {
            const rawList = JSON.parse(localStorage.getItem("myList")) || [];
            const migratedList = rawList.map((item) => ({
                ...item,
                type: item.type || (item.media_type === "tv" || item.first_air_date ? "tv" : "movie"),
            }));
            setMyList(migratedList);

            const rawCw = JSON.parse(localStorage.getItem("continueWatching")) || [];
            const migratedCw = rawCw.map((item) => ({
                ...item,
                type: item.type || (item.season && item.episode ? "tv" : "movie"),
            }));
            setContinueWatching(migratedCw);
        } catch (e) {}
    }, []);

    const toggleMyList = (item) => {
        setMyList((prev) => {
            const exists = prev.find((m) => m.id === item.id);
            const isTv = item.type === "tv" || item.media_type === "tv" || !!item.first_air_date;
            const normalized = {
                type: isTv ? "tv" : "movie",
                id: item.id,
                name: item.name || item.title,
                title: item.title || item.name,
                poster: item.poster_path || item.poster,
                poster_path: item.poster_path || item.poster,
                vote_average: item.vote_average,
                first_air_date: item.first_air_date,
                release_date: item.release_date,
            };
            const newList = exists ? prev.filter((m) => m.id !== item.id) : [normalized, ...prev];
            localStorage.setItem("myList", JSON.stringify(newList));
            return newList;
        });
    };

    const handleCardClick = (m) => {
        const isTv = m.type === "tv" || m.media_type === "tv" || !!m.first_air_date;
        if (isTv) {
            router.push(`/preview/tv/${m.id}`);
        } else {
            router.push(`/preview/movie/${m.id}`);
        }
    };

    const handleCwClick = (m) => {
        const isTv = m.type === "tv" || m.media_type === "tv" || !!m.first_air_date;
        if (isTv && m.season && m.episode) {
            router.push(`/watch/tv/${m.id}/${m.season}/${m.episode}`);
        } else if (isTv) {
            router.push(`/preview/tv/${m.id}`);
        } else {
            router.push(`/preview/movie/${m.id}`);
        }
    };

    useEffect(() => {
        // skip on mount — we already have server-rendered movies
        if (firstRender.current) { firstRender.current = false; return; }

        const controller = new AbortController();
        const q = query.trim();

        let url = "";
        if (q) {
            url = `/api/search?q=${encodeURIComponent(q)}`;
        } else if (genre === "my-list") {
            let list = myList;
            if (mediaFilter === "movie") list = myList.filter((m) => (m.type || "movie") === "movie");
            if (mediaFilter === "tv") list = myList.filter((m) => m.type === "tv" || m.media_type === "tv");
            setMovies(list);
            setFailed(false);
            return;
        } else if (genre === "recommendations") {
            const allIds = [...new Set([...continueWatching.map((m) => m.id), ...myList.map((m) => m.id)])];
            const typeQuery = mediaFilter !== "all" ? `&type=${mediaFilter}` : "";
            url = allIds.length > 0
                ? `/api/recommendations?ids=${allIds.slice(0, 3).join(",")}${typeQuery}`
                : `/api/recommendations${typeQuery ? `?${typeQuery.slice(1)}` : ""}`;
        } else if (genre === "all") {
            url = mediaFilter === "tv" ? "/api/tv/popular" : "/api/popular";
        } else {
            const typeQuery = mediaFilter !== "all" ? `?type=${mediaFilter}` : "";
            url = `/api/genre/${genre}${typeQuery}`;
        }

        // debounce typing 400ms; tab clicks fire immediately
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(url, { signal: controller.signal });
                if (!res.ok) throw new Error(`Server error ${res.status}`);
                const data = await res.json();
                let results = (data.results || []).filter((item) => item.media_type !== "person");
                if (q && mediaFilter !== "all") {
                    results = results.filter((item) => {
                        const itemType = item.type || item.media_type || (item.first_air_date ? "tv" : "movie");
                        return itemType === mediaFilter;
                    });
                }
                setMovies(results.slice(0, 18));
                setFailed(false);
            } catch (err) {
                if (err.name !== "AbortError") { setMovies([]); setFailed(true); }
            }
        }, q ? 400 : 0);

        return () => { clearTimeout(timer); controller.abort(); };
    }, [genre, query, mediaFilter, myList, continueWatching]);

    const hasHistory = continueWatching.length > 0 || myList.length > 0;
    const q = query.trim();
    const label = q
        ? `Results for “${q}”`
        : genre === "all"
            ? (mediaFilter === "tv" ? "Popular TV series" : mediaFilter === "movie" ? "Popular movies" : "Popular now")
            : genre === "my-list"
                ? "Your saved titles"
                : genre === "recommendations"
                    ? (hasHistory ? "Recommended for you" : "Curated for rainy evenings")
                    : `${GENRES.find((g) => g.key === genre)?.label || "Selected"} ${mediaFilter === "tv" ? "series" : "films"}`;

    return (
        <>
            <header className="nav">
                <div className="logo">rai<span>ne</span></div>

                <div className="filter-group">
                    <nav className="tabs media-filter-tabs" aria-label="Media filter">
                        {MEDIA_FILTERS.map((f) => (
                            <button
                                key={f.key}
                                className={`tab ${mediaFilter === f.key ? "active" : ""}`}
                                onClick={() => setMediaFilter(f.key)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </nav>

                    <nav className="tabs" aria-label="Genre categories">
                        {GENRES.map((g) => (
                            <button
                                key={g.key}
                                className={`tab ${genre === g.key && !q ? "active" : ""}`}
                                onClick={() => { setQuery(""); setGenre(g.key); }}
                            >
                                {g.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="search-wrap">
                    <input
                        className="search"
                        type="text"
                        placeholder="search the lake…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </header>

            <TypingHero />

            <main>
                {genre === "all" && !q && continueWatching.length > 0 && (
                    <>
                        <h2 className="section-label">Continue watching</h2>
                        <div className="horizontal-scroll">
                            {continueWatching.map((m) => (
                                <MovieCard
                                    key={`cw-${m.type || "item"}-${m.id}`}
                                    movie={m}
                                    onClick={() => handleCwClick(m)}
                                />
                            ))}
                        </div>
                    </>
                )}

                <h2 className="section-label">{label}</h2>

                <div className="grid">
                    {movies.map((m) => (
                        <MovieCard
                            key={`grid-${m.type || m.media_type || "item"}-${m.id}`}
                            movie={m}
                            onClick={() => handleCardClick(m)}
                        />
                    ))}
                </div>

                {movies.length === 0 && (
                    <p className="empty">
                        {failed
                            ? "The lake is unreachable. Check your API key in .env.local."
                            : genre === "recommendations" && !hasHistory && !q
                                ? "Save or watch films to receive personalized recommendations."
                                : "Nothing surfaced from the lake. Try another search."}
                    </p>
                )}
            </main>
        </>
    );
}
