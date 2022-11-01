// TODO: Add rich type for messages.
export function encodeMessage(message: string[]): string {
    return JSON.stringify(message);
}

export function decodeMessage(message: string): string[] {
    return JSON.parse(message);
}
