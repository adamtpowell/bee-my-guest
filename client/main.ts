import { Message } from "../shared/messaging.ts";
import { readLines } from "https://deno.land/std/io/buffer.ts";

const ws = new WebSocket("ws://localhost:8080");

// Non-blocking prompt
async function prompt() {
    for await (const line of readLines(Deno.stdin)) {
        return line;
    }
}

ws.onmessage = (m) => {
    console.log("SERVER SAYS|" + m.data);
};

ws.onopen = async (_) => {
    while (true) {
        const input = await prompt() || "exit";
        if (input as string == "exit") {
            ws.close();
            Deno.exit(0);
        }
        const args = input.split(" ");
        const message = new Message(undefined, args[0], args.slice(1));
        ws.send(message.stringify());
    }
};
