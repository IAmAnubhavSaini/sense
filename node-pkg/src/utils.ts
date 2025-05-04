import { isBrowser, isNode } from "./checks.js";

function generateUUID(): string {
    if (isBrowser()) {
        return crypto.randomUUID();
    }
    if (isNode()) {
        const { randomUUID } = require("node:crypto");
        return randomUUID();
    }
    throw new Error("Only Browser and Node is supported as of now.");
}

export { generateUUID };
