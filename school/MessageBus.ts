import { Message } from "../shared/messaging.ts";
import { Connection } from "./Connection.ts";

// A message bus. The main bus will be the global one onto which all models register listeners.
// The bus hooks into any connections added to it and relays their messages to all matching listeners.
// Models don't need to own any of the logic for whether they receive messages, they just specifiy which kinds they want.
export class MessageBus {
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
