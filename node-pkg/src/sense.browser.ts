import { Sense } from "./sense.js";

class BrowserSense extends Sense {
    protected dispatch(event: string, payload: any) {
        window.dispatchEvent(new CustomEvent(event, { detail: payload }));
    }

    protected listen(event: string, handler: (payload: any) => void) {
        window.addEventListener(event, (e: any) => handler(e.detail));
    }

    protected unlisten(event: string, handler: any) {
        window.removeEventListener(event, handler);
    }
}

export { BrowserSense as Sense };
