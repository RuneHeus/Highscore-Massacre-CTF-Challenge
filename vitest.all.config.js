import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "src/**/*.test.js",
      "server/__tests__/**/*.test.js"
    ],
    exclude: [
      "node_modules/",
      "dist/",
      "**/node_modules/**"
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.test.js",
        "**/*.spec.js"
      ]
    }
  }
});
