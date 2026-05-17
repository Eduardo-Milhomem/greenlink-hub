import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tanstackRouter from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [tanstackRouter(), react(), tailwindcss(), tsconfigPaths()],
  server: {
    allowedHosts: ["app.automato.space"],
  },
});
