import { Message } from "../shared/messaging.ts";
import { Server } from "../school/Server.ts";
import {
    assertEquals,
    assertStrictEquals,
    assertThrows,
} from "https://deno.land/std@0.163.0/testing/asserts.ts";
import {
    afterEach,
    beforeEach,
    describe,
    it,
} from "https://deno.land/std@0.163.0/testing/bdd.ts";

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

describe("Server", () => {
    let server: Server;

    beforeEach(() => {
        server = new Server();
        server.run();
    });

    it("echoes in response to echo", async () => {
        const [ws, sendMessage, getMessage] = await getWebsocket();

        sendMessage("echo", ["echo works"]);

        assertEquals(await getMessage(), "echo works");

        ws.close();
    });

    it("Denies chat messages from users not in conversation", async () => {
        const [ws, sendMessage, getMessage] = await getWebsocket();

        sendMessage("ModelConnect_Conversation", ["user1", "user2"]);

        sendMessage("SendMessage", ["hello!", "user3"]); // This user is not in the conversation

        sendMessage("SendMessage", ["hello!", "user1"]); // This user is in the conversation

        sendMessage("ListMessages", []);

        assertEquals(await getMessage(), "user1: hello!"); // The message should be from user1, and the other message should have been rejected.

        ws.close();
    });

    it("Accepts and lists chat messages", async () => {
        const [ws, sendMessage, getMessage] = await getWebsocket();

        sendMessage("ModelConnect_Conversation", ["user1", "user2"]);

        sendMessage("SendMessage", ["hello!", "user1"]);

        sendMessage("ListMessages", []);

        assertEquals(await getMessage(), "user1: hello!");

        ws.close();
    });

    afterEach(() => {
        server.close();
    });
});
