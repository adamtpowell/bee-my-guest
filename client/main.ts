const ws = new WebSocket("ws://localhost:8080");

ws.onmessage = (m) => {
    console.log("SERVER SAYS|" + m.data);
};

ws.onopen = _ => {
    while (true) {
        const message = prompt(">> ") || "exit";
        if (message as string == "exit") {
            ws.close();
            Deno.exit(0);
        }
        const args = message.split(" ");
        ws.send(JSON.stringify(args));
    }
}
