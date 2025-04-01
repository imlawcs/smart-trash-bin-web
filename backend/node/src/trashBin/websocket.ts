// import { WebSocketServer as Server } from "ws";
// import { Server as HTTPServer } from "http";

// let wss: Server;

// export function setupWebSocket(server: HTTPServer) {
//     wss = new Server({ server });

//     wss.on("connection", (ws) => {
//         console.log("Client connected to WebSocket");
//     });
// }

// export function sendWebSocketMessage(data: string) {
//     if (wss) {
//         wss.clients.forEach((client) => {
//             client.send(data);
//         });
//     }
// }
