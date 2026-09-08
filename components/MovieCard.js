import Image from "next/image";

const IMG = "https://image.tmdb.org/t/p/w500";

export default function MovieCard({ movie, onClick }) {
    const year = (movie.release_date || "—").slice(0, 4);
    const rating = movie.vote_average?.toFixed(1) ?? "–";

    return (
        <div className="card" onClick={onClick}>
            <div className="poster">
                {movie.poster_path ? (
                    <Image
                        src={IMG + movie.poster_path}
                        alt={movie.title}
                        fill
                        sizes="(max-width: 600px) 45vw, 200px"
                        style={{ objectFit: "cover" }}
                        className="poster-image"
                    />
                ) : (
                    <span className="poster-fallback">{movie.title}</span>
                )}
            </div>
            <div className="card-info">
                <h4>{movie.title}</h4>
                <p>
                    {year} · ★ {rating}
                </p>
            </div>
        </div>
    );
}
