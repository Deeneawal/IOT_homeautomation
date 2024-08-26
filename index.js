const mqtt = require('mqtt');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// setup express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MQTT setup
const mqttClient = mqtt.connect('mqtt://localhost'); // Replace with you MQTT broker adress



mqttClient.on('connect', () => { 
    console.log('Connected to MQTT broker');
    mqttClient.subscribe('hom/livingroom/temperature');
});

mqttClient.on('message', (topic, message) => {
    if (topic == 'home/livingroom/temperature'){
        const temperature = message.toString();
        io.emit('temperature', {value: temperature});
    }
});

// Serve static files
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.status(200).json({message: 'God job!!'});
})

// start server
server.listen(3000, () => {
    console.log('Server is running of port 3000');
})





