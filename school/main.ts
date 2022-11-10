import { Message } from "../shared/messaging.ts";

const server = Deno.listen({ port: 8080 });

class Connection {
    socket: WebSocket;
    // Listeners registered on this connection.
    listeners: { [index: string]: (message: Message) => void } = {};
    constructor(socket: WebSocket) {
        this.socket = socket;
    }

    // Add a listener for this specific connection.
    registerListener(message: string, listener: (message: Message) => void) {
        this.listeners[message] = listener;
    }
}

// A message bus. The main bus will be the global one onto which all models register listeners.
// The bus hooks into any connections added to it and relays their messages to all matching listeners.
// Models don't need to own any of the logic for whether they receive messages, they just specifiy which kinds they want.
class MessageBus {
    // A list of listeners registered under the bus. TODO: Add filters to this.
    // when any message is received on a connection, broadcast it to all relevant connections.
    listeners: { [index: string]: ((message: Message) => void)[] } = {};
    connections: Set<Connection> = new Set<Connection>();

    registerConnection(conn: Connection) {
        this.connections.add(conn);

        // Since the arrow function is run in the context of
        // the connection, this would be bound to the connection's this.
        // deno-lint-ignore no-this-alias
        const that = this;
        conn.registerListener("*", (m) => that.broadcastMessage(m));
    }

    registerListener(message: string, listener: (message: Message) => void) {
        if (!this.listeners[message]) {
            this.listeners[message] = [];
        }

        this.listeners[message].push(listener);
    }

    broadcastMessage(message: Message) {
        const filtered_listeners = this.listeners[message.name];
        if (!filtered_listeners) {
            console.log(
                "broadcastMessage: No listeners for message" + message.name,
            );
            return;
        }
        for (const listener of filtered_listeners) {
            listener(message);
        }
    }
}

// TODO: Add base class / mixin for holding a list of listeners.
// there will be methods on that base class for registering and deregistering
// the listeners.
// each type of model will define its own listeners in a list.
// They will also be a way to register the model connection listener.
class ModelConversation {
    messages: string[] = [];
    members: Set<string>;

    constructor(members: string[]) {
        this.members = new Set(members);
    }

    static registerListeners(bus: MessageBus) {
        bus.registerListener("echo", (message) => {
            message.reply(message.args[0]);
        });
        bus.registerListener("ModelConnect_Conversation", (message) => {
            // Here is where a model would be created.
            const model = new ModelConversation(message.args);

            // Register listeners from the model.
            bus.registerListener("SendMessage", (message) => {
                if (model.members.has(message.args[1])) {
                    model.messages.push(
                        message.args[1] + ": " + message.args[0],
                    );
                }
            });

            bus.registerListener("ListMessages", (message) => {
                message.reply("Messages so far:");
                for (const chat_message of model.messages) {
                    message.reply(chat_message);
                }
            });
        });
    }
}

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
