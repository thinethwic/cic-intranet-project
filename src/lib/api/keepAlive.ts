// Keeps the Render.com free-tier backend awake.
// Free tier spins down after 15 min of inactivity, causing a 30-50 s cold start.
// We send a lightweight ping immediately on load, then every 10 minutes.

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
const PING_URL = `${BASE_URL}/api/v1/news?page=0&size=1`;
const INTERVAL_MS = 10 * 60 * 1000;

function ping() {
  fetch(PING_URL).catch(() => {});
}

export function startKeepAlive(): void {
  ping();
  setInterval(ping, INTERVAL_MS);
}
