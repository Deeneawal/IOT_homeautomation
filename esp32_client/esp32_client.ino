#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// Sensor Configuration
#define DHTPIN 33         // DHT11 data pin
#define DHTTYPE DHT11
#define MQ2_PIN 34        // MQ2 analog pin
#define LIGHT_PIN 14      // Light sensor analog pin

// Calibration Constants
const float MQ2_R0 = 9.83;      // Calibrate in clean air
const float MQ2_SCALE_FACTOR = 25.0;  // Adjust based on your sensor
const float MQ2_MIN_PPM = 200.0;
const float MQ2_MAX_PPM = 10000.0;

// WiFi/MQTT Configuration
const char* ssid = "moto5g";
const char* pswrd = "1234567890";
const char* mqtt_server = "192.168.219.21";
const int mqtt_port = 1883;

DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

float readMQ2() {
  float sensorValue = analogRead(MQ2_PIN);
  float voltage = sensorValue * (3.3 / 4095.0);
  float ppm = (voltage * MQ2_SCALE_FACTOR) + MQ2_MIN_PPM;
  return constrain(ppm, MQ2_MIN_PPM, MQ2_MAX_PPM);
}

void setup_wifi() {
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, pswrd);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("MQTT connect...");
    if (client.connect("ESP32Client")) {
      Serial.println("connected");
      client.subscribe("esp/cmd");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retry in 5s");
      delay(5000);
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) message += (char)payload[i];
  Serial.printf("Message [%s]: %s\n", topic, message.c_str());
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  pinMode(LIGHT_PIN, INPUT);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  // Read DHT11
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("DHT sensor read failure!");
    return;
  }

  // Read other sensors
  float airQuality = readMQ2();
  int lightIntensity = analogRead(LIGHT_PIN);

  // Create payload (match database schema)
  String payload = 
    String(temperature, 1) + "," +   // Temperature (°C)
    String(humidity, 1) + "," +      // Humidity (%)
    String(airQuality, 0) + "," +    // Air quality (PPM)
    String(lightIntensity);          // Light intensity (0-4095)

  if (client.publish("home/sensors/data", payload.c_str())) {
    Serial.println("Published: " + payload);
  } else {
    Serial.println("Publish failed!");
  }
  
  delay(5000);  // 5-second interval
}