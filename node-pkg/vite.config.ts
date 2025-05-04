import { defineConfig } from "vite";

// Build both ESM and CJS from entry
export default defineConfig({
    build: {
        lib: {
            entry: {
                node: "src/sense.node.ts",
                browser: "src/sense.browser.ts",
            },
            name: "Sense",
            formats: ["es", "cjs"],
            fileName: (format, entryName) => {
                const ext = format === "es" ? "esm" : "cjs";
                return `sense.${entryName}.${ext}.js`;
            },
        },
        rollupOptions: {
            // Externalize dependencies like Node built-ins or libraries
            external: ["events", "crypto"],
        },
    },
});
