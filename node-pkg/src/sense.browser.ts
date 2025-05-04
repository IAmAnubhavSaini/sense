type SenseHandler<TInput = any, TOutput = any> = (input: TInput) => TOutput | Promise<TOutput>;
type SenseEventDetail = {
    input: any;
    key: string;
    output?: any;
    error?: unknown;
};

class Sense {
    protected static handlers: Record<string, SenseHandler> = {};

    static define<TInput = any, TOutput = any>(name: string, fn: SenseHandler<TInput, TOutput>) {
        this.handlers[name] = fn;
        const event = `need_${name}`;
        window.addEventListener(event, async (e: Event) => {
            const customEvent = e as CustomEvent<SenseEventDetail>;
            const { input, key } = customEvent.detail;
            try {
                const output = await fn(input);
                this.dispatch(`done_${name}`, { input, key, output });
            } catch (error) {
                this.dispatch(`done_${name}`, { input, key, error });
            }
        });
    }

    static async call<TInput = any, TOutput = any>(name: string, input: TInput): Promise<TOutput> {
        const key = crypto.randomUUID();
        const doneEvent = `done_${name}`;

        return new Promise<TOutput>((resolve, reject) => {
            const handler = (e: Event) => {
                const customEvent = e as CustomEvent<SenseEventDetail>;
                if (customEvent.detail.key === key) {
                    window.removeEventListener(doneEvent, handler);
                    if (customEvent.detail.error) {
                        reject(customEvent.detail.error);
                    } else {
                        resolve(customEvent.detail.output as TOutput);
                    }
                }
            };
            window.addEventListener(doneEvent, handler);
            this.dispatch(`need_${name}`, { input, key });
        });
    }

    static async workflow<T>(fn: () => Promise<T>): Promise<T> {
        return await fn();
    }

    protected static dispatch(event: string, detail: SenseEventDetail) {
        window.dispatchEvent(new CustomEvent(event, { detail }));
    }
}

export { Sense };
