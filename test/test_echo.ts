import { assert } from "https://deno.land/std@0.161.0/_util/assert.ts";

export async function testEcho(
    sendMessage: (name: string, args: string[]) => void,
    getMessage: () => Promise<unknown>,
) {
    sendMessage("echo", ["echo works"]);
    const reply = await getMessage();

    assert(reply == "echo", "Reply does not equal echo.");
}
