import { Message } from "../shared/messaging.ts";
import { assertEquals } from "https://deno.land/std@0.163.0/testing/asserts.ts";
import { Server } from "../school/Server.ts";

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
    const server = new Server();
    server.run();

    const [ws, sendMessage, getMessage] = await getWebsocket();

    sendMessage("echo", ["echo works"]);
    const reply = await getMessage();

    assertEquals(reply, "echo works");

    ws.close();
    server.close();
});

Deno.test("Test send messages", async () => {
    const server = new Server();
    server.run();

    const [ws, sendMessage, getMessage] = await getWebsocket();

    sendMessage("ModelConnect_Conversation", ["user1", "user2"]);

    sendMessage("SendMessage", ["hello!", "user1"]);

    sendMessage("ListMessages", []);

    const reply = await getMessage();
    assertEquals(reply, "Messages so far:");
    const reply2 = await getMessage();
    assertEquals(reply2, "user1: hello!");

    ws.close();
    server.close();
});

Deno.test("Server resets correctly", async () => {
    const server = new Server();
    server.run();

    const [ws, sendMessage, getMessage] = await getWebsocket();

    sendMessage("ModelConnect_Conversation", ["user1", "user2"]);

    sendMessage("ListMessages", []);

    const reply = await getMessage();
    assertEquals(reply, "Messages so far:");

    sendMessage("echo", ["echo works"]);
    const echoReply = await getMessage();

    assertEquals(echoReply, "echo works");

    ws.close();
    server.close();
});
