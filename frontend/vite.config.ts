import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [
    svgr({
      svgrOptions: {
        exportType: "named",
        ref: true,
        svgo: false,
        titleProp: true,
      },

      include: "**/*.svg",
    }),
    react(),
    tailwindcss(),
  ],
});
