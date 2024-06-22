import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import { flatRoutes } from "remix-flat-routes";

import { vercelPreset } from "@vercel/remix/vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
  server: {
    port: 4000,
  },
  plugins: [
    remix({
      routes: async (defineRoutes) => {
        return flatRoutes("routes", defineRoutes);
      },
      presets: [vercelPreset()],
    }),
    tsconfigPaths(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./test-utils/setup.ts",
  },
});
