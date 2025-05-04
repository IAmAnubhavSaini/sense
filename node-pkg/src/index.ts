import { isBrowser, isNode } from "./checks.js";

let Sense: any;

if (isBrowser()) {
    Sense = (await import("./sense.browser.js")).Sense;
} else if (isNode()) {
    Sense = (await import("./sense.node.js")).Sense;
} else {
    Sense = null;
}

export { Sense };
