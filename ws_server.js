// import { WebSocketServer } from "ws"; // Correct ES module import

// const wss = new WebSocketServer({ port: 8765 });

// wss.on("connection", (ws) => {
//     console.log("WebSocket connected");

//     ws.on("message", (message) => {
//         console.log(`Received: ${message}`);
//         ws.send(JSON.stringify({ status: "Received", data: message }));
//     });

//     ws.on("close", () => {
//         console.log("WebSocket disconnected");
//     });
// });

// console.log("WebSocket Server running at ws://localhost:8765");
// import { WebSocketServer } from "ws";
// import net from "net"; // Import TCP socket module

// const wss = new WebSocketServer({ port: 8765 });

// wss.on("connection", (ws) => {
//     console.log("WebSocket connected");

//     ws.on("message", (message) => {
//         console.log(`Received from WebSocket: ${message}`);

//         // Send received WebSocket message to Python TCP server
//         const client = new net.Socket();
//         client.connect(5000, "127.0.0.1", () => {
//             console.log("Connected to TCP server");
//             client.write(message.toString()); // Convert Buffer to string
//             client.end(); // Close TCP connection after sending
//         });

//         client.on("error", (err) => {
//             console.error("TCP Client Error:", err);
//         });

//         // Send acknowledgment back to WebSocket client
//         ws.send(JSON.stringify({ status: "Received", data: message.toString() }));
//     });

//     ws.on("close", () => {
//         console.log("WebSocket disconnected");
//     });
// });

// console.log("WebSocket Server running at ws://localhost:8765");
import { WebSocketServer } from "ws";
import net from "net"; // Import TCP socket module

const wss = new WebSocketServer({ port: 8765 });

wss.on("connection", (ws) => {
    console.log("WebSocket connected");

    ws.on("message", (message) => {
        console.log(`Received from WebSocket: ${message}`);

        // Send received WebSocket message to Python TCP server
        const client = new net.Socket();
        client.connect(5000, "127.0.0.1", () => {
            console.log("Connected to TCP server");
            client.write(message.toString()); // Convert Buffer to string
        });

        client.on("data", (data) => {
            console.log(`Received from Python: ${data.toString()}`);
            ws.send(data.toString()); // Send Python response back to frontend
            client.end(); // Close TCP connection after receiving response
        });

        client.on("error", (err) => {
            console.error("TCP Client Error:", err);
            ws.send(JSON.stringify({ error: "Failed to communicate with Python server" }));
        });
    });

    ws.on("close", () => {
        console.log("WebSocket disconnected");
    });
});

console.log("WebSocket Server running at ws://localhost:8765");
