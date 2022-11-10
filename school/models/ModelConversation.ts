import { MessageBus } from "../MessageBus.ts";

// TODO: Add base class / mixin for holding a list of listeners.
// there will be methods on that base class for registering and deregistering
// the listeners.
// each type of model will define its own listeners in a list.
// They will also be a way to register the model connection listener.
export class ModelConversation {
    messages: string[] = [];
    members: Set<string>;

    constructor(members: string[]) {
        this.members = new Set(members);
    }

    static registerListeners(bus: MessageBus) {
        bus.registerListener("echo", (message) => {
            message.reply(message.args[0]);
        });
        bus.registerListener("ModelConnect_Conversation", (message) => {
            // Here is where a model would be created.
            const model = new ModelConversation(message.args);

            // Register listeners from the model.
            bus.registerListener("SendMessage", (message) => {
                if (model.members.has(message.args[1])) {
                    model.messages.push(
                        message.args[1] + ": " + message.args[0],
                    );
                }
            });

            bus.registerListener("ListMessages", (message) => {
                for (const chat_message of model.messages) {
                    message.reply(chat_message);
                }
            });
        });
    }
}
