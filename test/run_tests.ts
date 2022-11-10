import { Message } from "../shared/messaging.ts";
import { assertEquals } from "https://deno.land/std@0.163.0/testing/asserts.ts";

function getWebsocket(): Promise<[
    WebSocket,
    (name: string, args: string[]) => void,
    () => Promise<unknown>,
]> {
    return new Promise((resolve, reject) => {
        function sendMessage(name: string, args: string[]) {
            const message = new Message(undefined, name, args);
            ws.send(message.stringify());
        }

        function getMessage() {
            return new Promise((resolve) => {
                resolver = resolve;
            });
        }
        const ws = new WebSocket("ws://localhost:8080");

        let resolver: (message: string) => void;
        ws.onmessage = (m) => {
            resolver(m.data);
        };

        ws.onopen = (_) => {
            resolve([ws, sendMessage, getMessage]);
        };
    });
}

Deno.test("Echo Test", async () => {
    const [ws, sendMessage, getMessage] = await getWebsocket();

    sendMessage("echo", ["echo works"]);
    const reply = await getMessage();

    assertEquals(reply, "echo works");

    ws.close();
});
