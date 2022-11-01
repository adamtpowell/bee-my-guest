import { Message } from "../shared/messaging.ts";

const server = Deno.listen({ port: 8080 });

class Connection {
    socket: WebSocket;
    // Listeners registered on this connection.
    listeners: { [index: string]: (data: string[]) => void } = {};
    constructor(socket: WebSocket) {
        this.socket = socket;
    }

    registerListener(message: string, listener: (data: string[]) => void) {
        this.listeners[message] = listener;
    }
}
// TODO: Add base class / mixin for holding a list of listeners.
// there will be methods on that base class for registering and deregistering
// the listeners.
// each type of model will define its own listeners in a list.
// They will also be a way to register the model connection listener.
class ModelConversation {
    messages: string[] = [];
}

function registerGlobalActions(conn: Connection) {
    conn.registerListener("ModelConnect_Conversation", (_) => {
        // Here is where a model would be created.
        const model = new ModelConversation();

        // Register listeners from the model.
        conn.registerListener("SendMessage", (args) => {
            console.log("Message Received!");
            model.messages.push(args[1] + ": " + args[0]);
        });

        conn.registerListener("ListMessages", (_) => {
            console.log("Messages so far:");
            for (const message of model.messages) {
                console.log(message);
            }
        });

        console.log("Connected to conversation model.");
    });
}

for await (const conn of server) {
    const httpConn = Deno.serveHttp(conn); // Turn the request into http

    for await (const e of httpConn) {
        const { socket, response } = Deno.upgradeWebSocket(e.request);
        const conn = receiveSocket(socket, response);
        registerGlobalActions(conn);
        conn.registerListener("test", (data) => {
            console.log("listener registered. received " + data as string);
        });
        e.respondWith(response);
    }
}

function receiveSocket(socket: WebSocket, _response: Response) {
    const conn = new Connection(socket);
    socket.onopen = () => {
    };
    socket.onmessage = (e) => {
        const message = Message.parse(e.data);
        // Call the registered listener for this message type.
        const listener = conn.listeners[message.name];
        if (listener) {
            listener(message.args);
        } else {
            console.log("Unknown Message");
        }
    };
    socket.onclose = () => console.log("websocket closed");
    socket.onerror = (e) => console.error("WebSocket error:", e);

    return conn;
}
