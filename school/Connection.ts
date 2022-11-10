import { Message } from "../shared/messaging.ts";

export class Connection {
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
