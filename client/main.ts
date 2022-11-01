import { Message, encodeMessage } from "../shared/messaging.ts";

const ws = new WebSocket("ws://localhost:8080");

ws.onmessage = (m) => {
    console.log("SERVER SAYS|" + m.data);
};

ws.onopen = (_) => {
    while (true) {
        const input = prompt(">> ") || "exit";
        if (input as string == "exit") {
            ws.close();
            Deno.exit(0);
        }
        const args = input.split(" ");
        const message = new Message(args[0], args.slice(1))
        ws.send(message.stringify())
    }
};
