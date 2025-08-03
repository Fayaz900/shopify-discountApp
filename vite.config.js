import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  build: {
    outDir: "extensions/timer/assets", // bundle output
    emptyOutDir: false,
    rollupOptions: {
      input: "./widget-src/index.jsx",
      output: { entryFileNames: "timer-widget.js" },
    },
  },
});
