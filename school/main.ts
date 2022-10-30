const server = Deno.listen({ port: 8080 });
for await (const conn of server) {
    const httpConn = Deno.serveHttp(conn); // Turn the request into http

    for await (const e of httpConn) {
        const { socket, response } = Deno.upgradeWebSocket(e.request);
        socket.onopen = () => {
            socket.send("Connected");
        };
        socket.onmessage = (e) => {
            console.log(e.data);
            socket.send(e.data);
        };
        socket.onclose = () => console.log("websocket closed");
        socket.onerror = (e) => console.error("WebSocket error:", e);
        e.respondWith(response);
    }
}
