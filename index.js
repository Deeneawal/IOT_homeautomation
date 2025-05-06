const express = require('express');
const mqtt = require('mqtt');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const sensorModel = require('./src/models/sensors.model');
const routes = require('./src/routes');
const MQTTService = require('./src/services/mqtt.service');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Initialize Socket.IO
const io = new Server(server, {
  path: '/socket.io',
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Middleware Configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

// Database Initialization
const initializeDatabase = async () => {
  try {
    await sensorModel.createSensorDataTable();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Socket.IO Event Handlers
const setupSocketIO = () => {
  io.on('connection', (socket) => {
    console.log('🌐 New client connected:', socket.id);

    const sendInitialData = async () => {
      try {
        const realtimeData = await sensorModel.getRecentSensorData();
        socket.emit('init', { realtime: realtimeData });
      } catch (error) {
        console.error('Initial data error:', error);
        socket.emit('error', 'Failed to load initial data');
      }
    };

    socket.on('requestData', async (params) => {
      try {
        const data = await sensorModel.getDataByParams(params);
        socket.emit('dataResponse', {
          type: params.type,
          data: data.map(item => ({
            ...item,
            airQuality: item.air_quality,
            lightIntensity: item.light_intensity
          }))
        });
      } catch (error) {
        socket.emit('error', { type: params?.type || 'general', message: error.message });
      }
    });

    socket.on('deviceControl', (command) => {
      if (typeof command === 'string') {
        MQTTService.publishCommand(command);
      } else {
        console.error('⚠️ Invalid device control command:', command);
      }
    });

    socket.on('disconnect', () => console.log('❌ Client disconnected:', socket.id));
    sendInitialData();
  });
};

// Server Startup
const startServer = async () => {
  try {
    await initializeDatabase();
    MQTTService.init(io);
    setupSocketIO();

    server.listen(port, () => console.log(`
      🚀 Server running on: http://localhost:${port}
      📡 MQTT Broker: ${MQTTService.getBrokerUrl()}
    `));
  } catch (error) {
    console.error('❌ Critical startup failure:', error);
    process.exit(1);
  }
};

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('\n🔧 Gracefully shutting down...');
  MQTTService.shutdown();
  server.close(() => process.exit());
});

// Start Application
startServer();