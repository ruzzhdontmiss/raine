import Image from "next/image";
import { useEffect } from "react";

const IMG = "https://image.tmdb.org/t/p/w500";

export default function MovieModal({ movie, onClose, inList, onToggleList, onPlay }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <div className="modal-poster">
                    {movie.poster_path && (
                        <Image
                            src={IMG + movie.poster_path}
                            alt={movie.title}
                            fill
                            sizes="200px"
                            style={{ objectFit: "cover" }}
                        />
                    )}
                </div>
                <div className="modal-body">
                    <h3>{movie.title}</h3>
                    <p className="modal-meta">
                        {(movie.release_date || "—").slice(0, 4)} · ★ {movie.vote_average?.toFixed(1) ?? "–"} · {movie.original_language?.toUpperCase()}
                    </p>
                    <p className="modal-desc">{movie.overview || "No description available."}</p>
                    <div className="modal-actions">
                        <button className="play-btn" onClick={onPlay}>▶ &nbsp;Play</button>
                        <button className="list-btn" onClick={onToggleList}>
                            {inList ? "✓ In List" : "+ My List"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
