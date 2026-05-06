function normalizeList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return [];
}

export async function fetchHistoryFromApi(axiosInstance) {
  try {
    const res = await axiosInstance.get("/api/user/history");
    return Array.isArray(res.data) ? res.data : normalizeList(res.data);
  } catch {
    return [];
  }
}
