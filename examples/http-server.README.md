# examples/http-server

An http-server in nodejs looks like:

```typescript
import { IncomingMessage, ServerResponse, createServer } from "http";

const hostname = "127.0.0.1";
const port = 3000;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello World");
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
```

A Sense based server would look like:

```typescript
import { IncomingMessage, ServerResponse, createServer } from "http";
import Sense from "@f0c1s/sense/node";

const hostname = "127.0.0.1";
const port = 3000;

/** define is function definition with extra steps */
Sense.define("handle_request", ([req, res, ts, i]) => {
    Sense.call("log", [`${i}th: handle_request at ${ts}`]);
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello bird");
});
Sense.define("full_host", ([port, hostname]) => `Server running at http://${hostname}:${port}/`);
Sense.define("log", ([value]) => console.log(value));
Sense.define("listen", ([server, port, hostname]) =>
    server.listen(
        port,
        hostname,
        async () => await Sense.call("log", [await Sense.call("full_host", [port, hostname])])
    )
);

/** workflow is main() */
Sense.workflow(async () => {
    let i = 0;
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
        setTimeout(() => Sense.call("log", [req.url]), 1000);
        Sense.call("handle_request", [req, res, Date.now(), i++]);
    });
    Sense.call("listen", [server, port, hostname]);
});

```
