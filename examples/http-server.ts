import { IncomingMessage, ServerResponse, createServer } from "http";
import Sense from "@f0c1s/sense/node";

const hostname = "127.0.0.1";
const port = 3000;

/** on is function definition with extra steps */
Sense.on("handle_request", ([req, res, ts, i]) => {
    Sense.need("log", [`${i}th: handle_request at ${ts}`]);
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello bird");
});
Sense.on("full_host", ([port, hostname]) => `Server running at http://${hostname}:${port}/`);
Sense.on("log", ([value]) => console.log(value));
Sense.on("listen", ([server, port, hostname]) =>
    server.listen(
        port,
        hostname,
        async () => await Sense.need("log", [await Sense.need("full_host", [port, hostname])])
    )
);

/** flow is main() */
Sense.flow(async () => {
    let i = 0;
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
        setTimeout(() => Sense.need("log", [req.url]), 1000);
        Sense.need("handle_request", [req, res, Date.now(), i++]);
    });
    Sense.need("listen", [server, port, hostname]);
});
