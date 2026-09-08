"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MovieCard from "./MovieCard";
import VidyPlayer from "./VidyPlayer";

export default function PreviewClient({ id, movie }) {
    const router = useRouter();
    const [logo, setLogo] = useState(null);
    const [trailerKey, setTrailerKey] = useState(null);
    const [cast, setCast] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    
    const [myList, setMyList] = useState([]);
    const [inList, setInList] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [showCinemaHeader, setShowCinemaHeader] = useState(true);

    useEffect(() => {
        if (!isPlaying) return;
        let timeout;
        const handleMouseMove = () => {
            setShowCinemaHeader(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setShowCinemaHeader(false), 3000);
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                if (!document.fullscreenElement) {
                    setIsPlaying(false);
                }
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timeout);
        };
    }, [isPlaying]);

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
            setInList(!!list.find((m) => m.id === movie.id));
        } catch (e) {}

        const fetchExtraData = async () => {
            try {
                // Fetch images for logo
                fetch(`/api/movie/${id}/images`)
                    .then(res => res.json())
                    .then(data => {
                        const enLogos = data.logos?.filter(l => l.iso_639_1 === "en") || [];
                        const bestLogo = enLogos.length > 0 ? enLogos[0] : (data.logos?.[0]);
                        if (bestLogo) setLogo(`https://image.tmdb.org/t/p/w500${bestLogo.file_path}`);
                    });

                // Fetch videos for trailer
                fetch(`/api/movie/${id}/videos`)
                    .then(res => res.json())
                    .then(data => {
                        const trailer = data.results?.find(v => v.type === "Trailer" && v.site === "YouTube");
                        if (trailer) setTrailerKey(trailer.key);
                    });

                // Fetch cast
                fetch(`/api/movie/${id}/credits`)
                    .then(res => res.json())
                    .then(data => {
                        setCast(data.cast?.slice(0, 12) || []);
                    });

                // Fetch recommendations
                fetch(`/api/movie/${id}/recommendations`)
                    .then(res => res.json())
                    .then(data => {
                        setRecommendations(data.results?.slice(0, 10) || []);
                    });
            } catch (err) {
                console.error("Failed to fetch preview extra data", err);
            }
        };

        fetchExtraData();
    }, [id, movie.id]);

    const toggleMyList = () => {
        setMyList((prev) => {
            const exists = prev.find((m) => m.id === movie.id);
            const newList = exists ? prev.filter((m) => m.id !== movie.id) : [movie, ...prev];
            localStorage.setItem("myList", JSON.stringify(newList));
            setInList(!exists);
            return newList;
        });
    };

    const handlePlay = () => {
        try {
            const cw = JSON.parse(localStorage.getItem("continueWatching")) || [];
            const newList = [movie, ...cw.filter((m) => m.id !== movie.id)].slice(0, 10);
            localStorage.setItem("continueWatching", JSON.stringify(newList));
        } catch (e) {}
        
        setIsPlaying(true);
    };

    const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : "";
    
    const year = movie.release_date ? movie.release_date.substring(0, 4) : "";
    const rating = movie.vote_average?.toFixed(1) || "";
    const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "";

    return (
        <div className="preview-page">
            {isPlaying && (
                <div className="cinema-overlay">
                    <div className={`cinema-header ${showCinemaHeader ? '' : 'hidden'}`}>
                        <button onClick={() => setIsPlaying(false)} className="cinema-back">
                            ← Back
                        </button>
                        <span className="cinema-title">{movie.title}</span>
                        <button 
                            onClick={() => {
                                if (document.fullscreenElement) {
                                    document.exitFullscreen();
                                } else {
                                    document.querySelector('.cinema-player').requestFullscreen();
                                }
                            }}
                            className="cinema-fs"
                        >
                            {document.fullscreenElement ? '⊽' : '⊼'}
                        </button>
                    </div>
                    
                    <div className="cinema-player">
                        <VidyPlayer 
                            tmdbId={movie.id} 
                            type="movie" 
                            title={movie.title}
                            color="7fb3d5"
                        />
                    </div>
                </div>
            )}

            <header className={`preview-header ${scrolled ? 'scrolled' : ''}`}>
                <Link href="/">
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
                    <div style={{ position: 'relative', height: '120px', width: '100%', maxWidth: '400px', marginBottom: '16px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
                        <Image src={logo} alt={movie.title} fill style={{ objectFit: 'contain', objectPosition: 'left bottom' }} />
                    </div>
                ) : (
                    <h1>{movie.title}</h1>
                )}

                <div className="meta">
                    {year && <span>{year}</span>}
                    {year && runtime && <span>·</span>}
                    {runtime && <span>{runtime}</span>}
                    {rating && <span>·</span>}
                    {rating && <span>★ {rating}</span>}
                </div>

                <p className="desc">
                    {movie.overview}
                </p>

                <div className="hero-actions">
                    <button className="btn-play" onClick={handlePlay}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Play
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
                {cast.length > 0 && (
                    <>
                        <h3 className="section-accent">Cast</h3>
                        <p className="section-sub">The cast behind this title</p>
                        <div className="cast-scroll">
                            {cast.map(c => (
                                <div key={c.id} className="cast-card">
                                    {c.profile_path ? (
                                        <img src={`https://image.tmdb.org/t/p/w185${c.profile_path}`} alt={c.name} />
                                    ) : (
                                        <div style={{ width: '100%', height: '160px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.2)' }}>?</span>
                                        </div>
                                    )}
                                    <h5>{c.name}</h5>
                                    <p>{c.character}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {recommendations.length > 0 && (
                    <div style={{ marginTop: '40px' }}>
                        <h3 className="section-accent">You may like</h3>
                        <p className="section-sub">Similar titles to explore</p>
                        <div className="horizontal-scroll" style={{ paddingLeft: 0, paddingRight: 0 }}>
                            {recommendations.map(m => (
                                <MovieCard key={m.id} movie={m} onClick={() => router.push(`/preview/movie/${m.id}`)} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
