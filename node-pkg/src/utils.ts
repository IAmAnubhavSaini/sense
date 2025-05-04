import { isBrowser, isNode } from "./checks.js";

async function generateUUID(): Promise<string> {
    if (isBrowser()) {
        return crypto.randomUUID();
    }
    if (isNode()) {
        const { randomUUID } = await import("node:crypto");
        return randomUUID();
    }
    throw new Error("Only Browser and Node is supported as of now.");
}

export { generateUUID };
