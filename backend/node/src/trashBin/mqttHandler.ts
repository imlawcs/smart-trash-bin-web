// import mqtt from "mqtt";

// const MQTT_BROKER = process.env.MQTT_BROKER || "mqtt://localhost";
// const TOPIC = process.env.MQTT_TOPIC || "trash/full";

// export function setupMQTT(sendWebSocketMessage: (data: string) => void) {
//     const client = mqtt.connect(MQTT_BROKER);

//     client.on("connect", () => {
//         console.log("Connected to MQTT Broker");
//         client.subscribe(TOPIC);
//     });

//     client.on("message", (topic, message) => {
//         if (topic === TOPIC) {
//             console.log(`Received message: ${message.toString()}`);
//             sendWebSocketMessage(message.toString());
//         }
//     });

//     client.on("error", (error) => {
//         console.error("MQTT Error:", error);
//     });
// }
