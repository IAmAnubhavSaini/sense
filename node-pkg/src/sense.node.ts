import { EventEmitter } from "events";
import { randomUUID } from "crypto";

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

    static on<TInput = any, TOutput = any>(name: string, fn: SenseHandler<TInput, TOutput>) {
        this.handlers[name] = fn;
        this.emitter.on(`need_${name}`, async (detail: SenseEventDetail) => {
            const handler = this.handlers[name];
            if (!handler) return;
            try {
                const output = await handler(detail.input);
                this.emitter.emit(`done_${name}`, { ...detail, output });
            } catch (error) {
                this.emitter.emit(`done_${name}`, { ...detail, error });
            }
        });
    }

    static async need<TInput = any, TOutput = any>(name: string, input: TInput): Promise<TOutput> {
        const key = randomUUID();

        return new Promise<TOutput>((resolve, reject) => {
            const doneEvent = `done_${name}`;

            const handler = (detail: SenseEventDetail) => {
                if (detail.key === key) {
                    this.emitter.off(doneEvent, handler);
                    if (detail.error) reject(detail.error);
                    else resolve(detail.output as TOutput);
                }
            };

            this.emitter.on(doneEvent, handler);
            this.emitter.emit(`need_${name}`, { input, key });
        });
    }

    static async flow<T>(fn: () => Promise<T>): Promise<T> {
        try {
            return await fn();
        } catch (err) {
            console.error("Workflow Error:", err);
            throw err;
        }
    }
}

export default Sense;
