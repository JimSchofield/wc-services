import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["lit", "react", "react-dom"],
  },
  test: {
    browser: {
      provider: playwright(),
      enabled: true,
      instances: [{ browser: "chromium" }],
    },
  },
});
