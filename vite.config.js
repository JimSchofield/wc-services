import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: [
        resolve(__dirname, "./lib/index.ts"),
        resolve(__dirname, "./lib/decorators/index.ts"),
        resolve(__dirname, "./lib/lit/index.ts"),
      ],
      formats: ['es'],
    },
    minify: false,
    terserOptions: {
      compress: false,
      mangle: false,
    },
    rollupOptions: {
      input: [
        resolve(__dirname, "./lib/index.ts"),
        resolve(__dirname, "./lib/decorators/index.ts"),
        resolve(__dirname, "./lib/lit/index.ts"),
      ],
      output: {
        preserveModules: true,
      },
    },
  },
  plugins: [dts({ 
    tsconfigPath: "./tsconfig.json",
    include: "lib",

  })],
});
