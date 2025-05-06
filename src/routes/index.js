const express = require('express');
const router = express.Router();
const path = require('path');
const sensorController = require('../controllers/sensors.controller');  // Single import

// UI Routes
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/graph.html')); 
});

router.get('/records', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/sensor_records.html'));
});

// API Routes
router.post('/sensor', sensorController.createSensorData);
router.get('/sensor', sensorController.getAllSensorData);
router.post('/sensor/search', sensorController.getSensorDataWithinRange);
router.get('/sensor/:id', sensorController.getSensorDataById);
router.delete('/sensor/:id', sensorController.deleteSensorData);

module.exports = router;