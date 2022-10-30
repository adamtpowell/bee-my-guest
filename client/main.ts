const ws = new WebSocket("ws://localhost:8080");

ws.onmessage = (m) => {
    console.log("SERVER SAYS|" + m.data);
};

ws.onopen = _ => {
    while (true) {
        const message = prompt(">> ");
        if (message as string == "exit") {
            ws.close();
            Deno.exit(0);
        }
        ws.send(message as string);
    }
}
