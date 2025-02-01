import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      name: "Leigh",
      // the proper extensions will be added
      fileName: "index",
    },
  },
  plugins: [dts({ tsconfigPath: "./tsconfig.json" })],
});
