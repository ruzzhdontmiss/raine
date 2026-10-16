const TMDB = "https://api.themoviedb.org/3";

export async function tmdb(endpoint, params = {}) {
    const url = new URL(TMDB + endpoint);
    url.searchParams.set("api_key", process.env.TMDB_API_KEY);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    // cache TMDB responses on the server for 10 minutes, with retry for ECONNRESET and 5xx
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const res = await fetch(url.toString(), { next: { revalidate: 600 } });
            if (!res.ok) {
                const error = new Error(`TMDB error ${res.status}`);
                error.status = res.status;
                // Fail fast on deterministic 4xx client errors without retrying
                if (res.status >= 400 && res.status < 500) {
                    throw error;
                }
                throw error;
            }
            return await res.json();
        } catch (err) {
            // Do not retry 4xx errors
            if (err.status >= 400 && err.status < 500) throw err;
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
