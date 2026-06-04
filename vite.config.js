import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuration Vite. `base: "./"` permet de servir l'app depuis n'importe quel
// sous-chemin (utile sur Netlify avec ou sans domaine personnalisé).
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    sourcemap: false,
    // Empile tout en un seul fichier JS pour faciliter le déploiement statique
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
