const express = require('express');
const http = require('http');
const mqtt = require('mqtt');
const app = express();
const port = 3000;

// Middleware to parse JSON data
app.use(express.json());

// MQTT setup
const mqttClient = mqtt.connect('mqtt://localhost'); // Use your MQTT broker address

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe('home/livingroom/temperature'); // Subscribe to the temperature topic
});

mqttClient.on('message', (topic, message) => {
    if (topic === 'home/livingroom/temperature') {
        const temperature = message.toString();
        console.log(`Received temperature: ${temperature}`);
        // Optionally, you could handle the received temperature here, e.g., store it in a database
    }
});

// Endpoint to handle incoming data from ESP32
app.get('/', (req, res) => {
    console.log("hello, world");
    res.status(200).send('Data received');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// about to add socketId
// again