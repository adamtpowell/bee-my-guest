// TODO: Add rich type for messages.
export function encodeMessage(name: string, args: string[]): string {
    return JSON.stringify({"name": name, "args": args});
}

export function decodeMessage(message: string): {name: string, args: string[]} {
    return JSON.parse(message);
}
