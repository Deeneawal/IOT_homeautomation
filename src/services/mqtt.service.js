const mqtt = require('mqtt');
const sensorService = require('./sensors.service');

class MQTTService {
  constructor() {
    this.io = null;
    this.client = null;
    this.brokerUrl = 'mqtt://192.168.219.21:1883';
  }

  init(ioInstance) {
    this.io = ioInstance;
    this.client = mqtt.connect(this.brokerUrl);
    this.setupHandlers();
  }

  setupHandlers() {
    this.client.on('connect', () => {
      console.log('🔌 MQTT Connected');
      this.client.subscribe('home/sensors/data');
    });

    this.client.on('message', async (topic, message) => {
      try {
        await this.handleSensorData(topic, message);
      } catch (error) {
        console.error('MQTT Processing Error:', error);
      }
    });

    this.client.on('error', (err) => {
      console.error('MQTT Connection Error:', err);
    });
  }

  async handleSensorData(topic, message) {
    let sensorData = null;
    try {
      const rawMessage = message.toString();
      console.log('[MQTT] Raw message:', rawMessage);

      const values = rawMessage.split(',');
      if (values.length !== 4) {
        throw new Error('Invalid data format. Expected 4 comma-separated values');
      }

      // Match updated database schema: temperature, humidity, air_quality, light_intensity
      sensorData = {
        temperature: parseFloat(values[0]),
        humidity: parseFloat(values[1]),    // Changed from pressure
        airQuality: parseFloat(values[2]),
        lightIntensity: parseFloat(values[3])
      };

      if (Object.values(sensorData).some(isNaN)) {
        throw new Error('Non-numeric values detected');
      }

      const savedData = await sensorService.createSensorData(sensorData);
      
      this.io.emit('sensorUpdate', {
        ...savedData,
        air_quality: savedData.airQuality,
        light_intensity: savedData.lightIntensity,
        humidity: savedData.humidity  // Added humidity field
      });

      console.log('[MQTT] Parsed data:', sensorData);

    } catch (error) {
      console.error('MQTT Data Error:', error.message);
      console.error('Problematic data:', sensorData || 'No valid data parsed');
    }
  }

  publishCommand(command) {
    this.client.publish('esp/cmd', command);
  }

  shutdown() {
    this.client.end();
  }

  getBrokerUrl() {
    return this.brokerUrl;
  }
}

module.exports = new MQTTService();