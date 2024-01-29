import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./test-utils/setup.ts",
    coverage: {
      provider: "v8",
      include: ["**/app/**"],
      reporter: ["text", "json"],
    },
  },
  resolve: {
    alias: {
      "~testing-library": path.resolve(__dirname, "./test-utils"),
    },
  },
});
