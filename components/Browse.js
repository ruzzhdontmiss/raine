"use client";
import { useEffect, useRef, useState } from "react";
import TypingHero from "./TypingHero";
import MovieCard from "./MovieCard";
import MovieModal from "./MovieModal";

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
    const [movies, setMovies] = useState(initialMovies);
    const [genre, setGenre] = useState("all");
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(null);
    const [failed, setFailed] = useState(false);
    const [myList, setMyList] = useState([]);
    const [continueWatching, setContinueWatching] = useState([]);
    const firstRender = useRef(true);

    useEffect(() => {
        try {
            setMyList(JSON.parse(localStorage.getItem("myList")) || []);
            setContinueWatching(JSON.parse(localStorage.getItem("continueWatching")) || []);
        } catch (e) {}
    }, []);

    const toggleMyList = (movie) => {
        setMyList((prev) => {
            const exists = prev.find((m) => m.id === movie.id);
            const newList = exists ? prev.filter((m) => m.id !== movie.id) : [movie, ...prev];
            localStorage.setItem("myList", JSON.stringify(newList));
            return newList;
        });
    };

    const addToContinueWatching = (movie) => {
        setContinueWatching((prev) => {
            const newList = [movie, ...prev.filter((m) => m.id !== movie.id)].slice(0, 10);
            localStorage.setItem("continueWatching", JSON.stringify(newList));
            return newList;
        });
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
            setMovies(myList);
            setFailed(false);
            return;
        } else if (genre === "recommendations") {
            const allIds = [...new Set([...continueWatching.map(m => m.id), ...myList.map(m => m.id)])];
            if (allIds.length === 0) {
                setMovies([]);
                setFailed(false);
                return;
            }
            url = `/api/recommendations?ids=${allIds.slice(0, 3).join(",")}`;
        } else if (genre === "all") {
            url = "/api/popular";
        } else {
            url = `/api/genre/${genre}`;
        }

        // debounce typing 400ms; tab clicks fire immediately
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(url, { signal: controller.signal });
                if (!res.ok) throw new Error(`Server error ${res.status}`);
                const data = await res.json();
                setMovies((data.results || []).slice(0, 18));
                setFailed(false);
            } catch (err) {
                if (err.name !== "AbortError") { setMovies([]); setFailed(true); }
            }
        }, q ? 400 : 0);

        return () => { clearTimeout(timer); controller.abort(); };
    }, [genre, query]);

    const q = query.trim();
    const label = q
        ? `Results for “${q}”`
        : genre === "all"
            ? "Popular now"
            : genre === "my-list"
                ? "Your saved films"
                : genre === "recommendations"
                    ? "Recommended for you"
                    : `${GENRES.find((g) => g.key === genre).label} films`;

    return (
        <>
            <header className="nav">
                <div className="logo">rai<span>ne</span></div>

                <nav className="tabs">
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
                                <MovieCard key={m.id} movie={m} onClick={() => setSelected(m)} />
                            ))}
                        </div>
                    </>
                )}

                <h2 className="section-label">{label}</h2>

                <div className="grid">
                    {movies.map((m) => (
                        <MovieCard key={m.id} movie={m} onClick={() => setSelected(m)} />
                    ))}
                </div>

                {movies.length === 0 && (
                    <p className="empty">
                        {failed
                            ? "The lake is unreachable. Check your API key in .env.local."
                            : genre === "recommendations" && continueWatching.length === 0 && myList.length === 0 && !q
                                ? "Save or watch films to receive personalized recommendations."
                                : "Nothing surfaced from the lake. Try another search."}
                    </p>
                )}
            </main>

            {selected && (
                <MovieModal
                    movie={selected}
                    onClose={() => setSelected(null)}
                    inList={!!myList.find((m) => m.id === selected.id)}
                    onToggleList={() => toggleMyList(selected)}
                    onPlay={() => { addToContinueWatching(selected); setSelected(null); }}
                />
            )}
        </>
    );
}
