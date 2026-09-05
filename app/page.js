import { tmdb } from "@/lib/tmdb";
import Browse from "@/components/Browse";

export default async function Home() {
  let initialMovies = [];
  try {
    const data = await tmdb("/movie/popular");
    initialMovies = (data.results || []).slice(0, 18);
  } catch {
    // Browse will show the error state if this is empty
  }

  return <Browse initialMovies={initialMovies} />;
}
