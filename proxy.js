import { NextResponse } from "next/server";
import {
    isValidId,
    isValidIdsList,
    isValidType,
    isValidSeasonNum,
    sanitizeSearchQuery,
} from "@/lib/validation";

export function proxy(request) {
    const { pathname, searchParams } = request.nextUrl;

    if (!pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    // 1. /api/movie/:id and sub-resources (/credits, /images, /recommendations, /videos)
    const movieMatch = pathname.match(/^\/api\/movie\/([^/]+)(?:\/(credits|images|recommendations|videos))?$/);
    if (movieMatch) {
        const id = movieMatch[1];
        if (!isValidId(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        return NextResponse.next();
    }

    // 2. /api/tv/:id/season/:num
    const tvSeasonMatch = pathname.match(/^\/api\/tv\/([^/]+)\/season\/([^/]+)$/);
    if (tvSeasonMatch) {
        const [, id, num] = tvSeasonMatch;
        if (!isValidId(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        if (!isValidSeasonNum(num)) {
            return NextResponse.json({ error: "Invalid season number (must be between 1 and 100)" }, { status: 400 });
        }
        return NextResponse.next();
    }

    // 3. /api/tv/:id (excluding /api/tv/popular)
    if (pathname.startsWith("/api/tv/") && !pathname.startsWith("/api/tv/popular")) {
        const tvMatch = pathname.match(/^\/api\/tv\/([^/]+)$/);
        if (tvMatch) {
            const id = tvMatch[1];
            if (!isValidId(id)) {
                return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
            }
        }
        return NextResponse.next();
    }

    // 4. /api/genre/:id
    const genreMatch = pathname.match(/^\/api\/genre\/([^/]+)$/);
    if (genreMatch) {
        const id = genreMatch[1];
        if (!isValidId(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        const type = searchParams.get("type");
        if (type && !isValidType(type)) {
            return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
        }
        return NextResponse.next();
    }

    // 5. /api/search
    if (pathname === "/api/search") {
        const rawQ = searchParams.get("q");
        if (!rawQ || !rawQ.trim()) {
            return NextResponse.json({ error: "Missing query" }, { status: 400 });
        }
        if (rawQ.trim().length > 100) {
            return NextResponse.json({ error: "Query exceeds maximum length of 100 characters" }, { status: 400 });
        }
        const cleaned = sanitizeSearchQuery(rawQ);
        if (!cleaned) {
            return NextResponse.json({ error: "Missing query" }, { status: 400 });
        }
        return NextResponse.next();
    }

    // 6. /api/recommendations
    if (pathname === "/api/recommendations") {
        const idsParam = searchParams.get("ids");
        if (idsParam && !isValidIdsList(idsParam)) {
            return NextResponse.json({ error: "Invalid IDs list" }, { status: 400 });
        }
        const type = searchParams.get("type");
        if (type && !isValidType(type)) {
            return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
        }
        return NextResponse.next();
    }

    // 7. /api/popular
    if (pathname === "/api/popular") {
        const type = searchParams.get("type");
        if (type && !isValidType(type)) {
            return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/api/:path*"],
};
