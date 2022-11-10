import { Message } from "../shared/messaging.ts";
import { Connection } from "./Connection.ts";
import { MessageBus } from "./MessageBus.ts";
import { ModelConversation } from "./models/ModelConversation.ts";

function receiveSocket(
    socket: WebSocket,
    _response: Response,
    bus: MessageBus,
): Connection {
    const conn = new Connection(socket);
    bus.registerConnection(conn);

    socket.onopen = () => {
    };
    socket.onmessage = (e) => {
        const message = Message.parse(socket, e.data);

        const listener = conn.listeners[message.name];

        // A listener with message * responds to everything.
        const star_listener = conn.listeners["*"];

        let sent = false;
        if (listener) {
            listener(message);
            sent = true;
        }
        if (star_listener && listener != star_listener) {
            star_listener(message);
            sent = true;
        }

        if (!sent) {
            socket.send("Unknown Message");
        }
    };
    socket.onclose = () => {
    };
    socket.onerror = (e) => console.error("WebSocket error:", e);

    return conn;
}

class Server {
    listener: Deno.Listener;
    bus: MessageBus;

    constructor() {
        this.listener = Deno.listen({ port: 8080 });
        this.bus = new MessageBus();
    }

    async runServer() {
        for await (const conn of this.listener) {
            const httpConn = Deno.serveHttp(conn); // Turn the request into http
            const e = await httpConn.nextRequest();

            if (!e) {
                console.log(
                    "Connection unexpectedly closed in http connection for websocket",
                );
                continue;
            }

            const { socket, response } = Deno.upgradeWebSocket(e.request);
            receiveSocket(socket, response, this.bus);

            // TODO: move this somewhere sane
            ModelConversation.registerListeners(this.bus);

            e.respondWith(response);
        }
    }
}

const server = new Server();
server.runServer();
