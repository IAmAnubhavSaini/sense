import { EventEmitter } from "events";
import { generateUUID } from "./utils.js";

type SenseHandler<TInput = any, TOutput = any> = (input: TInput) => TOutput | Promise<TOutput>;
type SenseEventDetail = {
    input: any;
    key: string;
    output?: any;
    error?: unknown;
};

class Sense {
    protected static emitter = new EventEmitter();
    protected static handlers: Record<string, SenseHandler> = {};
    protected static listeners: Record<string, (e: CustomEvent<SenseEventDetail>) => void> = {};
    protected static cache: Map<string, any> = new Map();
    protected static timeout = 5000;

    static define<TInput = any, TOutput = any>(name: string, fn: SenseHandler<TInput, TOutput>) {
        if (Sense.listeners[name]) {
            Sense.unlisten(`need_${name}`, Sense.listeners[name]);
        }
        Sense.handlers[name] = fn;
        Sense.listen(name, fn);
    }

    static async call<TInput = any, TOutput = any>(
        name: string,
        input: TInput,
        options: { timeout?: number } = {}
    ): Promise<TOutput> {
        let key = "";
        try {
            key = await generateUUID();
        } catch (e) {
            console.error(e);
            throw e;
        }
        const timeout = options.timeout ?? Sense.timeout;
        const cacheKey = `${name}:${JSON.stringify(input)}`;

        if (Sense.cache.has(cacheKey)) {
            return Sense.cache.get(cacheKey);
        }

        return new Promise<TOutput>((resolve, reject) => {
            const doneEvent = `done_${name}`;

            const handler = (e: Event) => {
                const customEvent = e as CustomEvent<SenseEventDetail>;
                if (customEvent.detail?.key === key) {
                    clearTimeout(timeoutId);
                    Sense.unlisten(doneEvent, handler);
                    if (customEvent.detail.error) {
                        reject(customEvent.detail.error);
                    } else {
                        Sense.cache.set(cacheKey, customEvent.detail.output);
                        resolve(customEvent.detail.output as TOutput);
                    }
                }
            };

            const timeoutId = setTimeout(() => {
                Sense.unlisten(doneEvent, handler);
                reject(new Error(`Timeout: ${name} operation took too long.`));
            }, timeout);
            Sense.listen(doneEvent, handler);
            Sense.dispatch(`need_${name}`, { input, key });
        });
    }

    static async workflow<T>(fn: () => Promise<T>): Promise<T> {
        try {
            return await fn();
        } catch (err) {
            console.error("Workflow Error:", err);
            throw err;
        }
    }

    protected static dispatch(event: string, payload: any) {
        Sense.emitter.emit(event, payload);
    }

    protected static async trigger(event: string, data: SenseEventDetail) {
        const name = event.replace(/^need_/, "");
        const fn = Sense.handlers[name];
        if (!fn) return;

        try {
            const output = await fn(data.input);
            Sense.dispatch(`done_${name}`, { ...data, output });
        } catch (err) {
            Sense.dispatch(`done_${name}`, { ...data, output: null, error: err });
        }
    }

    protected static listen(event: string, handler: (payload: any) => void) {
        Sense.emitter.on(event, handler);
    }

    protected static unlisten(event: string, handler: any) {
        Sense.emitter.off(event, handler);
    }

    static setTimeoutDuration(timeout: number) {
        Sense.timeout = timeout;
    }
}

export { Sense };
