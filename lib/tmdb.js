const TMDB = "https://api.themoviedb.org/3";

export async function tmdb(endpoint, params = {}) {
    const url = new URL(TMDB + endpoint);
    url.searchParams.set("api_key", process.env.TMDB_API_KEY);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    // cache TMDB responses on the server for 10 minutes, with retry for ECONNRESET
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const res = await fetch(url, { next: { revalidate: 600 } });
            if (!res.ok) throw new Error(`TMDB error ${res.status}`);
            return await res.json();
        } catch (err) {
            if (attempt === 3) throw err;
            await new Promise((r) => setTimeout(r, 500)); // wait 500ms before retry
        }
    }
}

export async function getMovieDetails(id) {
    return tmdb(`/movie/${id}`);
}

export function getImageUrl(path, size = "w500") {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
}
