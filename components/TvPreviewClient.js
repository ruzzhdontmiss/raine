"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MovieCard from "./MovieCard";

export default function TvPreviewClient({ id, show }) {
    const router = useRouter();

    const enLogos = show.images?.logos?.filter((l) => l.iso_639_1 === "en") || [];
    const bestLogo = enLogos.length > 0 ? enLogos[0] : show.images?.logos?.[0];
    const initialLogo = bestLogo ? `https://image.tmdb.org/t/p/w500${bestLogo.file_path}` : null;

    const trailer = show.videos?.results?.find((v) => v.type === "Trailer" && v.site === "YouTube");
    const initialTrailerKey = trailer ? trailer.key : null;

    const logo = initialLogo;
    const trailerKey = initialTrailerKey;
    const cast = show.aggregate_credits?.cast?.slice(0, 12) || [];
    const recommendations = show.recommendations?.results?.slice(0, 10) || [];

    const validSeasons = (show.seasons || []).filter((s) => s.episode_count > 0);
    const defaultSeason = validSeasons.find((s) => s.season_number > 0)?.season_number ?? validSeasons[0]?.season_number ?? 1;

    const [selectedSeason, setSelectedSeason] = useState(defaultSeason);
    const [seasonData, setSeasonData] = useState({});
    const [loadingSeason, setLoadingSeason] = useState(false);

    const [myList, setMyList] = useState([]);
    const [inList, setInList] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const [resumeTarget, setResumeTarget] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 100);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        try {
            const list = JSON.parse(localStorage.getItem("myList")) || [];
            setMyList(list);
            setInList(!!list.find((m) => m.id === show.id));

            const cw = JSON.parse(localStorage.getItem("continueWatching")) || [];
            const existing = cw.find((item) => item.id === show.id && item.type === "tv");
            if (existing && existing.season && existing.episode) {
                setResumeTarget({ season: existing.season, episode: existing.episode });
            }
        } catch (e) {}
    }, [show.id]);

    useEffect(() => {
        if (!selectedSeason && selectedSeason !== 0) return;
        if (seasonData[selectedSeason]) return;

        setLoadingSeason(true);
        fetch(`/api/tv/${id}/season/${selectedSeason}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load season");
                return res.json();
            })
            .then((data) => {
                setSeasonData((prev) => ({ ...prev, [selectedSeason]: data }));
            })
            .catch((err) => {
                console.error("Error fetching season data", err);
            })
            .finally(() => {
                setLoadingSeason(false);
            });
    }, [id, selectedSeason, seasonData]);

    const toggleMyList = () => {
        setMyList((prev) => {
            const exists = prev.find((m) => m.id === show.id);
            const item = {
                type: "tv",
                id: show.id,
                title: show.name,
                name: show.name,
                poster_path: show.poster_path,
                backdrop_path: show.backdrop_path,
                vote_average: show.vote_average,
                first_air_date: show.first_air_date,
            };
            const newList = exists ? prev.filter((m) => m.id !== show.id) : [item, ...prev];
            localStorage.setItem("myList", JSON.stringify(newList));
            setInList(!exists);
            return newList;
        });
    };

    const handlePlayInitial = () => {
        if (resumeTarget) {
            router.push(`/watch/tv/${id}/${resumeTarget.season}/${resumeTarget.episode}`);
            return;
        }
        const firstEp = seasonData[selectedSeason]?.episodes?.[0]?.episode_number || 1;
        router.push(`/watch/tv/${id}/${selectedSeason}/${firstEp}`);
    };

    const backdropUrl = show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : "";
    const year = show.first_air_date ? show.first_air_date.substring(0, 4) : "";
    const rating = show.vote_average?.toFixed(1) || "";
    
    // Content rating from US or first available
    const contentRating = show.content_ratings?.results?.find((r) => r.iso_3166_1 === "US")?.rating || 
                          show.content_ratings?.results?.[0]?.rating || "";
    
    const avgRuntime = show.episode_run_time?.[0] ? `${show.episode_run_time[0]}m` : "";
    const genres = show.genres?.map((g) => g.name).slice(0, 3).join(", ");
    const currentSeasonEpisodes = seasonData[selectedSeason]?.episodes || [];

    return (
        <div className="preview-page">
            <header className={`preview-header ${scrolled ? "scrolled" : ""}`}>
                <Link href="/" aria-label="Back to browse">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </Link>
            </header>

            {backdropUrl && (
                <div 
                    className="preview-backdrop" 
                    style={{ backgroundImage: `url(${backdropUrl})` }}
                />
            )}

            {trailerKey && (
                <div className="preview-trailer-bg">
                    <iframe
                        src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&controls=0&showinfo=0&rel=0&playlist=${trailerKey}`}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                    ></iframe>
                </div>
            )}

            <div className="preview-overlay" />

            <div className="preview-hero">
                {logo ? (
                    <div style={{ position: "relative", height: "120px", width: "100%", maxWidth: "400px", marginBottom: "16px", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}>
                        <Image src={logo} alt={show.name} fill style={{ objectFit: "contain", objectPosition: "left bottom" }} />
                    </div>
                ) : (
                    <h1>{show.name}</h1>
                )}

                {show.tagline && <p style={{ fontStyle: "italic", color: "rgba(255,255,255,0.75)", marginBottom: "8px", fontSize: "0.95rem" }}>{show.tagline}</p>}

                <div className="meta">
                    {year && <span>{year}</span>}
                    {contentRating && <span>·</span>}
                    {contentRating && <span className="media-badge">{contentRating}</span>}
                    {show.status && <span>·</span>}
                    {show.status && <span>{show.status}</span>}
                    {avgRuntime && <span>·</span>}
                    {avgRuntime && <span>~{avgRuntime}</span>}
                    {rating && <span>·</span>}
                    {rating && <span>★ {rating}</span>}
                    {genres && <span>·</span>}
                    {genres && <span>{genres}</span>}
                </div>

                <p className="desc">{show.overview}</p>

                <div className="hero-actions">
                    <button className="btn-play" onClick={handlePlayInitial}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        {resumeTarget ? `Resume S${resumeTarget.season}E${resumeTarget.episode}` : `Play S${selectedSeason}E1`}
                    </button>
                    <button className="btn-secondary" onClick={toggleMyList}>
                        {inList ? "✓ Saved" : "+ My List"}
                    </button>
                </div>

                {trailerKey && (
                    <button className="unmute-btn" onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? "🔇 Unmute" : "🔊 Mute"}
                    </button>
                )}
            </div>

            <div className="preview-content">
                {/* Seasons & Episodes Section */}
                <h3 className="section-accent">Episodes</h3>
                <p className="section-sub">Browse seasons and select an episode to play</p>

                {validSeasons.length > 0 && (
                    <div className="season-tabs">
                        {validSeasons.map((s) => {
                            const label = s.season_number === 0 ? "Specials" : `Season ${s.season_number}`;
                            return (
                                <button
                                    key={s.id}
                                    className={`season-tab ${selectedSeason === s.season_number ? "active" : ""}`}
                                    onClick={() => setSelectedSeason(s.season_number)}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {loadingSeason && (
                    <div style={{ padding: "24px 0", color: "var(--ink-soft)", fontSize: "0.88rem" }}>
                        Loading episodes…
                    </div>
                )}

                {!loadingSeason && currentSeasonEpisodes.length > 0 && (
                    <div className="episodes-list">
                        {currentSeasonEpisodes.map((ep) => {
                            const today = new Date().toISOString().slice(0, 10);
                            const isUnaired = !ep.air_date || ep.air_date > today;
                            const epRuntime = ep.runtime
                                ? `${ep.runtime}m`
                                : show.episode_run_time?.[0]
                                    ? `~${show.episode_run_time[0]}m`
                                    : "";

                            const stillContent = (
                                <div className="episode-still">
                                    {ep.still_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                                            alt={ep.name}
                                            fill
                                            sizes="160px"
                                            style={{ objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div className="episode-still-fallback">
                                            <span>E{ep.episode_number}</span>
                                        </div>
                                    )}
                                </div>
                            );

                            const infoContent = (
                                <div className="episode-info">
                                    <div className="episode-title">
                                        <span>{ep.episode_number}. {ep.name}</span>
                                    </div>
                                    <div className="episode-meta">
                                        {ep.air_date ? (
                                            <span>{isUnaired ? `Airs ${ep.air_date}` : ep.air_date}</span>
                                        ) : (
                                            <span>Air date TBA</span>
                                        )}
                                        {epRuntime && <span> · {epRuntime}</span>}
                                    </div>
                                    <p className="episode-overview">{ep.overview || "No episode overview available."}</p>
                                </div>
                            );

                            if (isUnaired) {
                                return (
                                    <div key={ep.id} className="episode-card unaired">
                                        {stillContent}
                                        {infoContent}
                                        <span className="episode-unaired-badge">Not yet aired</span>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={ep.id}
                                    href={`/watch/tv/${id}/${selectedSeason}/${ep.episode_number}`}
                                    className="episode-card"
                                >
                                    {stillContent}
                                    {infoContent}
                                    <div className="episode-play-btn" aria-label={`Play episode ${ep.episode_number}`}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                        </svg>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Cast Section */}
                {cast.length > 0 && (
                    <div style={{ marginTop: "44px" }}>
                        <h3 className="section-accent">Cast</h3>
                        <p className="section-sub">Series cast & recurring roles</p>
                        <div className="cast-scroll">
                            {cast.map((c) => {
                                const charName = c.roles?.[0]?.character || c.character || "";
                                return (
                                    <div key={c.id} className="cast-card">
                                        {c.profile_path ? (
                                            <div style={{ position: "relative", width: "100%", height: "160px", borderRadius: "8px", overflow: "hidden" }}>
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w185${c.profile_path}`}
                                                    alt={c.name}
                                                    fill
                                                    sizes="120px"
                                                    style={{ objectFit: "cover" }}
                                                />
                                            </div>
                                        ) : (
                                            <div style={{ width: "100%", height: "160px", background: "rgba(255,255,255,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <span style={{ fontSize: "2rem", color: "rgba(255,255,255,0.2)" }}>?</span>
                                            </div>
                                        )}
                                        <h5>{c.name}</h5>
                                        <p>{charName}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recommendations Section */}
                {recommendations.length > 0 && (
                    <div style={{ marginTop: "44px" }}>
                        <h3 className="section-accent">You may like</h3>
                        <p className="section-sub">Similar series to explore</p>
                        <div className="horizontal-scroll" style={{ paddingLeft: 0, paddingRight: 0 }}>
                            {recommendations.map((m) => {
                                const isMovie = m.media_type === "movie";
                                const targetUrl = isMovie ? `/preview/movie/${m.id}` : `/preview/tv/${m.id}`;
                                return (
                                    <MovieCard
                                        key={m.id}
                                        movie={{
                                            ...m,
                                            title: m.title || m.name,
                                            media_type: m.media_type || "tv",
                                        }}
                                        onClick={() => router.push(targetUrl)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
