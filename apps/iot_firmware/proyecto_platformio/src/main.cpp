#include <Arduino.h>
#include <LittleFS.h>
#include <time.h>
#include "DeviceManager.h"
#include "WiFiManager.h"
#include "ScaleManager.h"
#include "MqttManager.h"
#include "SelfTestManager.h"

// --- Pin Definitions ---
#define HX711_DOUT 13 // GPIO13
#define HX711_SCK 12  // GPIO12

// --- Local MQTT Broker ---
const char* MQTT_BROKER_IP = "192.168.100.73";

// --- Global Objects ---
ScaleManager scaleManager(HX711_DOUT, HX711_SCK);
DeviceManager deviceManager(scaleManager);
WiFiManager wifiManager;
MqttManager mqttManager(deviceManager, MQTT_BROKER_IP);
SelfTestManager selfTestManager;

// --- Global State ---
bool healthReportSent = false;
String healthReportContent;
unsigned long lastSensorPublish = 0;
const long sensorPublishInterval = 5000; // 5 seconds

// --- NTP TIME SETUP FUNCTION ---

// --- NTP TIME SETUP FUNCTION ---
void setupTime() {
    const char* ntpServer = "pool.ntp.org";
    // GMT+0, no daylight saving
    configTime(0, 0, ntpServer);

    Serial.print("Waiting for NTP time sync: ");
    time_t now = time(nullptr);
    while (now < 8 * 3600 * 2) {
        delay(500);
        Serial.print(".");
        now = time(nullptr);
    }
    Serial.println("");
    struct tm timeinfo;
    gmtime_r(&now, &timeinfo);
    Serial.print("Current time: ");
    Serial.print(asctime(&timeinfo));
}

void setup() {
    Serial.begin(115200);
    LittleFS.begin();
    Serial.println("\nStarting KittyPaw Firmware...");

    deviceManager.setup();
    Serial.println("Device ID: " + deviceManager.getDeviceId());

    wifiManager.setup();

    // --- Wait for WiFi and Set Time ---
    Serial.println("Waiting for WiFi connection...");
    while (!wifiManager.isConnected()) {
        wifiManager.loop();
        delay(100);
    }
    Serial.println("WiFi connected!");

    setupTime();

    Serial.println("Setting up ScaleManager...");
    scaleManager.setup();
    Serial.println("ScaleManager setup complete.");

    Serial.println("Setting up MqttManager...");
    mqttManager.setup(deviceManager.getDeviceId());
    Serial.println("MqttManager setup complete.");

    // Run self-test to prepare the report
    Serial.println("Running self-test...");
    healthReportContent = selfTestManager.runTests();
    Serial.println("Self-test complete.");
    Serial.println("Health Report Generated: " + healthReportContent);
}

void loop() {
    wifiManager.loop();
    mqttManager.loop();
    scaleManager.loop();

    if (wifiManager.isConnected() && mqttManager.isConnected()) {
        // Publish health report once on the first connection
        if (!healthReportSent) {
            Serial.println("Publishing health report...");
            mqttManager.publishHealthReport(healthReportContent);
            healthReportSent = true;
        }

        ConsumptionEvent event;
        if (scaleManager.getConsumptionEvent(event)) {
            Serial.println("Consumption event detected!");
            mqttManager.publishConsumptionEvent(event, deviceManager.getDeviceMode());
        }

        // Periodically publish sensor data
        if (millis() - lastSensorPublish > sensorPublishInterval) {
            lastSensorPublish = millis();
            String sensorData = deviceManager.getSensorData();
            Serial.println("Publishing sensor data: " + sensorData);
            mqttManager.publishSensorData(sensorData);
        }
    }
}
