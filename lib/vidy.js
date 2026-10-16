export function buildVidyUrl({
    type = "movie",
    id,
    season = 1,
    episode = 1,
    color = "7fb3d5",
    progress = 0,
    nextEpisode = false,
    episodeSelector = false,
    autoplayNextEpisode = false,
}) {
    if (!id) return "";
    if (type === "movie") {
        return `https://vidy.st/movie/${id}?color=${color}&progress=${progress}`;
    }
    return `https://vidy.st/tv/${id}/${season}/${episode}?color=${color}&progress=${progress}&nextEpisode=${nextEpisode}&episodeSelector=${episodeSelector}&autoplayNextEpisode=${autoplayNextEpisode}`;
}
