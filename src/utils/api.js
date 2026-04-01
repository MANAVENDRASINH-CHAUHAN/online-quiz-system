const API_BASE = (import.meta.env.VITE_API_BASE || "/api").replace(/\/$/, "");

export function apiUrl(path) {
  const normalizedPath = String(path || "").replace(/^\//, "");
  return `${API_BASE}/${normalizedPath}`;
}

export async function fetchJson(path, options = {}) {
  const response = await fetch(apiUrl(path), options);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}
