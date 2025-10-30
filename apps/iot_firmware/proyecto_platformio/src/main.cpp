#include <Arduino.h>
#include <LittleFS.h>
#include <time.h>
#include "DeviceManager.h"
#include "WiFiManager.h"
#include "ScaleManager.h"
#include "MqttManager.h"
#include "SelfTestManager.h"
#include "CameraManager.h"
#include "ObjectDetector.h"
#include "WebServerManager.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"

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
CameraManager cameraManager;
ObjectDetector* objectDetector;
WebServerManager* webServerManager; // Declared as pointer

// --- Global State ---
bool healthReportSent = false;
String healthReportContent;
unsigned long lastSensorPublish = 0;
const long sensorPublishInterval = 5000; // 5 seconds
QueueHandle_t detectionQueue;

// --- Object Detection Task ---
void detection_task(void *pvParameters) {
    while (true) {
        objectDetector->run();
        vTaskDelay(100 / portTICK_PERIOD_MS); // Small delay to prevent watchdog timeout
    }
}

// --- NTP TIME SETUP FUNCTION ---
void setupTime() {
    const char* ntpServer = "pool.ntp.org";
    configTime(-4 * 3600, 0, ntpServer);

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
    if (!LittleFS.begin()) {
        Serial.println("LittleFS Mount Failed!");
        return; // Halt if LittleFS fails to mount
    }
    Serial.println("\nStarting KittyPaw Firmware...");

    deviceManager.setup();
    Serial.println("Device ID: " + deviceManager.getDeviceId());

    wifiManager.setup();

    Serial.println("Waiting for WiFi connection...");
    while (!wifiManager.isConnected()) {
        wifiManager.loop();
        delay(100);
    }
    Serial.println("WiFi connected!");

    setupTime();

    detectionQueue = xQueueCreate(10, sizeof(detection_t));
    objectDetector = new ObjectDetector(detectionQueue);
    webServerManager = new WebServerManager(cameraManager, objectDetector); // Allocated after objectDetector

    Serial.println("Setting up CameraManager...");
    if (cameraManager.init()) {
        Serial.println("CameraManager setup complete.");
        Serial.println("Setting up WebServerManager...");
        webServerManager->setup(); // Use pointer
        Serial.println("WebServerManager setup complete.");
    } else {
        Serial.println("CameraManager setup failed.");
    }

    Serial.println("Setting up ObjectDetector...");
    if (objectDetector->init()) {
        Serial.println("ObjectDetector setup complete.");
        xTaskCreatePinnedToCore(
            detection_task,          /* Task function. */
            "DetectionTask",         /* name of task. */
            20000,                   /* Stack size of task */
            NULL,                    /* parameter of the task */
            1,                       /* priority of the task */
            NULL,                    /* Task handle to keep track of created task */
            1);                      /* pin task to core 1 */
        Serial.println("Object detection task started on Core 1.");
    } else {
        Serial.println("ObjectDetector setup failed.");
    }

    Serial.println("Setting up ScaleManager...");
    scaleManager.setup();
    Serial.println("ScaleManager setup complete.");

    Serial.println("Setting up MqttManager...");
    mqttManager.setup(deviceManager.getDeviceId());
    Serial.println("MqttManager setup complete.");

    Serial.println("Running self-test...");
    healthReportContent = selfTestManager.runTests();
    Serial.println("Self-test complete.");
    Serial.println("Health Report Generated: " + healthReportContent);
}

void loop() {
    webServerManager->loop(); // Use pointer
    wifiManager.loop();
    mqttManager.loop();
    scaleManager.loop();

    // Handle detection results
    detection_t detection;
    std::vector<detection_t> detections;
    while (xQueueReceive(detectionQueue, &detection, 0) == pdTRUE) {
        detections.push_back(detection);
        // Also publish to MQTT
        String topic = "kittypaw/" + deviceManager.getDeviceId() + "/detection";
        String payload = "{\"label\":\"" + String(detection.label) + "\",\"value\":\"" + String(detection.value) + "\"}";
        mqttManager.publish(topic, payload);
    }
    if (!detections.empty()) {
        webServerManager->sendDetectionResults(detections); // Use pointer
    }


    if (wifiManager.isConnected() && mqttManager.isConnected()) {
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

        if (millis() - lastSensorPublish > sensorPublishInterval) {
            lastSensorPublish = millis();
            String sensorData = deviceManager.getSensorData();
            Serial.println("Publishing sensor data: " + sensorData);
            mqttManager.publishSensorData(sensorData);
        }
    }
}
