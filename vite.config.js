import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: [
        resolve(__dirname, "./lib/index.ts"),
        resolve(__dirname, "./lib/decorators/service.ts"),
        resolve(__dirname, "./lib/decorators/service-to-service.ts"),
        resolve(__dirname, "./lib/lit/index.ts"),
        resolve(__dirname, "./lib/react/index.ts"),
      ],
      formats: ["es"],
    },
    minify: false,
    terserOptions: {
      compress: false,
      mangle: false,
    },
    rollupOptions: {
      input: [
        resolve(__dirname, "./lib/index.ts"),
        resolve(__dirname, "./lib/decorators/service.ts"),
        resolve(__dirname, "./lib/decorators/service-to-service.ts"),
        resolve(__dirname, "./lib/lit/index.ts"),
        resolve(__dirname, "./lib/react/index.ts"),
      ],
      external: ["lit", /^lit\//, "react"],
      output: {
        preserveModules: true,
      },
    },
  },
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.json",
      include: "lib",
    }),
  ],
});
