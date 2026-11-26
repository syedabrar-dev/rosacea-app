import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Keep the local site and Flask API on the same IPv4 loopback host. This
  // avoids browsers resolving localhost to IPv6 while Flask listens on IPv4.
  server: { host: "127.0.0.1", port: 5173 },
});
