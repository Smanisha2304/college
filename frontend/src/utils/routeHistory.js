const STORAGE_KEY_PREFIX = "smartroute_route_history_v1";

function getStorageKey(userKey) {
  if (!userKey) return `${STORAGE_KEY_PREFIX}_guest`;
  return `${STORAGE_KEY_PREFIX}_${String(userKey)}`;
}

function normalizeList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.history)) return payload.history;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

/**
 * Tries backend history first (does not change contract if missing).
 * Expected shapes (any): [] | { history: [] } | { items: [] }
 */
export async function fetchHistoryFromApi(axiosInstance) {
  try {
    const res = await axiosInstance.get("/api/route-history");
    return normalizeList(res.data);
  } catch {
    return [];
  }
}

export function loadLocalHistory(userKey) {
  try {
    const raw = localStorage.getItem(getStorageKey(userKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalHistoryEntry(entry, userKey) {
  const list = loadLocalHistory(userKey);
  const item = {
    id: entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    destination: entry.destination || "",
    sourceLabel: entry.sourceLabel || "",
    createdAt: entry.createdAt || new Date().toISOString(),
  };
  const next = [item, ...list.filter((h) => h.destination !== item.destination || h.createdAt !== item.createdAt)].slice(
    0,
    50
  );
  localStorage.setItem(getStorageKey(userKey), JSON.stringify(next));
}

export function mergeHistory(remote, local) {
  const seen = new Set();
  const merged = [];

  const push = (row) => {
    if (!row?.destination) return;
    const key = `${row.destination}|${row.createdAt || ""}|${row.sourceLabel || ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push({
      id: row.id || key,
      destination: row.destination,
      sourceLabel: row.sourceLabel || "",
      createdAt: row.createdAt || new Date().toISOString(),
    });
  };

  [...remote, ...local].forEach(push);

  merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return merged;
}
