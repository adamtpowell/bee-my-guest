import { Message } from "../shared/messaging.ts";
import { Connection } from "./Connection.ts";
import { MessageBus } from "./MessageBus.ts";
import { ModelConversation } from "./models/ModelConversation.ts";

function receiveSocket(
    socket: WebSocket,
    _response: Response,
    bus: MessageBus,
) {
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

const server = Deno.listen({ port: 8080 });

const global_bus = new MessageBus();

for await (const conn of server) {
    const httpConn = Deno.serveHttp(conn); // Turn the request into http

    for await (const e of httpConn) {
        const { socket, response } = Deno.upgradeWebSocket(e.request);
        receiveSocket(socket, response, global_bus);

        ModelConversation.registerListeners(global_bus);

        e.respondWith(response);
    }
}
