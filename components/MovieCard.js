import Image from "next/image";

const IMG = "https://image.tmdb.org/t/p/w500";

export default function MovieCard({ movie, onClick }) {
    const isTv = movie.type === "tv" || movie.media_type === "tv" || !!movie.first_air_date;
    const title = movie.title || movie.name || "Untitled";
    const year = (movie.release_date || movie.first_air_date || "—").slice(0, 4);
    const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : "–";
    const posterPath = movie.poster_path || movie.poster;

    const isTvResume = isTv && movie.season && movie.episode;

    return (
        <div className="card" onClick={onClick}>
            <div className="poster">
                {posterPath ? (
                    <Image
                        src={posterPath.startsWith("http") ? posterPath : IMG + posterPath}
                        alt={title}
                        fill
                        sizes="(max-width: 600px) 45vw, 200px"
                        style={{ objectFit: "cover" }}
                        className="poster-image"
                    />
                ) : (
                    <span className="poster-fallback">{title}</span>
                )}
                <span className="media-tag">{isTv ? "TV" : "Film"}</span>
            </div>
            <div className="card-info">
                <h4>{title}</h4>
                <p>
                    {isTvResume ? (
                        <span className="resume-tag">
                            Resume S{movie.season}E{movie.episode}{movie.episodeName ? ` · ${movie.episodeName}` : ""}
                        </span>
                    ) : (
                        `${year} · ★ ${rating}`
                    )}
                </p>
            </div>
        </div>
    );
}
