const TMDB = "https://api.themoviedb.org/3";

export async function tmdb(endpoint, params = {}) {
    const url = new URL(TMDB + endpoint);
    url.searchParams.set("api_key", process.env.TMDB_API_KEY);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    // cache TMDB responses on the server for 10 minutes
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`TMDB error ${res.status}`);
    return res.json();
}
