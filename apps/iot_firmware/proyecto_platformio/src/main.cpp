#include <Arduino.h>
#include <LittleFS.h>
#include "DeviceManager.h"
#include "WiFiManager.h"
#include "ScaleManager.h"
#include "MqttManager.h"
#include "SelfTestManager.h"

// --- Pin Definitions ---
#define HX711_DOUT D1
#define HX711_SCK D2

// --- AWS IoT Endpoint ---
const char* AWS_IOT_ENDPOINT = "a2fvfjwoybq3qw-ats.iot.us-east-2.amazonaws.com";

// --- Global Objects ---
DeviceManager deviceManager;
WiFiManager wifiManager;
ScaleManager scaleManager(HX711_DOUT, HX711_SCK);
MqttManager mqttManager(deviceManager, AWS_IOT_ENDPOINT);
SelfTestManager selfTestManager;

// --- Global State ---
bool healthReportSent = false;
String healthReportContent;

void setup() {
    Serial.begin(115200);
    LittleFS.begin();
    Serial.println("\nStarting KittyPaw Firmware...");

    deviceManager.setup();
    Serial.println("Device ID: " + deviceManager.getDeviceId());

    wifiManager.setup();
    scaleManager.setup();
    mqttManager.setup(deviceManager.getDeviceId());

    // Run self-test to prepare the report
    healthReportContent = selfTestManager.runTests();
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
    }
}
