const isBrowser = () => typeof window !== "undefined" && typeof window.document !== "undefined";
const isNode = () => typeof process !== "undefined" && process.versions?.node;

export { isBrowser, isNode };
