#include <Arduino.h>
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
MqttManager mqttManager(AWS_IOT_ENDPOINT);
SelfTestManager selfTestManager;

void setup() {
    Serial.begin(115200);
    Serial.println("\nStarting KittyPaw Firmware...");

    deviceManager.setup();
    Serial.println("Device ID: " + deviceManager.getDeviceId());

    wifiManager.setup();
    scaleManager.setup();
    mqttManager.setup(deviceManager.getDeviceId());

    // Run self-test and publish report
    String healthReport = selfTestManager.runTests();
    Serial.println("Health Report: " + healthReport);
    if (mqttManager.isConnected()) {
        mqttManager.publishHealthReport(healthReport);
    }
}

void loop() {
    wifiManager.loop();
    mqttManager.loop();
    scaleManager.loop();

    if (wifiManager.isConnected() && mqttManager.isConnected()) {
        ConsumptionEvent event;
        if (scaleManager.getConsumptionEvent(event)) {
            Serial.println("Consumption event detected!");
            mqttManager.publishConsumptionEvent(event, deviceManager.getDeviceMode());
        }
    }
}
