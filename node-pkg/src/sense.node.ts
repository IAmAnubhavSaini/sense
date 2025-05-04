import { EventEmitter } from "events";
import { Sense } from "./sense.js";

class NodeSense extends Sense {
    protected emitter = new EventEmitter();

    protected dispatch(event: string, payload: any) {
        this.emitter.emit(event, payload);
    }

    protected listen(event: string, handler: (payload: any) => void) {
        this.emitter.on(event, handler);
    }

    protected unlisten(event: string, handler: any) {
        this.emitter.off(event, handler);
    }
}

export { NodeSense as Sense };
