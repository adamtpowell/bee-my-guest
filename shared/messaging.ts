export class Message {
    name: string;
    args: string[];
    socket?: WebSocket;

    constructor(socket: WebSocket | undefined, name: string, args: string[]) {
        this.name = name;
        this.args = args;
        this.socket = socket;
    }

    stringify() {
        return JSON.stringify({ name: this.name, args: this.args });
    }

    reply(message: any) {
        if (this.socket) {
            this.socket.send(message);
        }
    }

    static parse(socket: WebSocket, message: string): Message {
        const obj = JSON.parse(message);
        return new this(socket, obj.name, obj.args);
    }
}
