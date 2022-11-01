export class Message {
    name: string;
    args: string[];

    constructor(name: string, args: string[]) {
        this.name = name;
        this.args = args;
    }

    stringify() {
        return JSON.stringify({ name: this.name, args: this.args });
    }

    static parse(message: string): { name: string; args: string[] } {
        const obj = JSON.parse(message);
        return new Message(obj.name, obj.args);
    }
}
