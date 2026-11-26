// Keep the API on the same hostname so local session cookies work across ports.
const localHost = window.location.hostname || "localhost";
export const API = import.meta.env.VITE_API_URL || `http://${localHost}:5000`;
