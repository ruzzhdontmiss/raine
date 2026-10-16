/**
 * Input validation & sanitization helpers for RAINE API routes
 */

export function isValidId(id) {
    if (!id || typeof id !== "string") return false;
    if (!/^\d+$/.test(id)) return false;
    const num = parseInt(id, 10);
    return num > 0 && num <= 2147483647;
}

export function isValidIdsList(idsParam) {
    if (!idsParam || typeof idsParam !== "string") return false;
    const list = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
    if (list.length === 0 || list.length > 10) return false;
    return list.every((id) => /^\d+$/.test(id) && parseInt(id, 10) > 0);
}

export function sanitizeSearchQuery(q) {
    if (!q || typeof q !== "string") return "";
    return q.replace(/[\x00-\x1F\x7F]/g, "").trim();
}

export function isValidType(type) {
    if (!type) return true; // optional parameter
    return ["movie", "tv", "all"].includes(type);
}

export function isValidSeasonNum(num) {
    if (!num || typeof num !== "string") return false;
    if (!/^\d+$/.test(num)) return false;
    const n = parseInt(num, 10);
    return n >= 1 && n <= 100;
}
