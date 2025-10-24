#include "DeviceManager.h"
#include <LittleFS.h>
#include <ArduinoJson.h>
#include <WiFi.h>

// Pin definitions from legacy code
#define DHT_PIN 14 // GPIO14
#define LDR_PIN A0

DeviceManager::DeviceManager(ScaleManager& scaleManager)
    : _scaleManager(scaleManager) {
    // Initialize the other managers
    _tempHumManager = new TemperatureHumidityManager(DHT_PIN, DHT11);
    _lightManager = new LightManager(LDR_PIN);
}

void DeviceManager::setup() {
    // Set fixed device ID
    _deviceId = "KPCL0025";

    _loadConfig();

    // Setup the sensors
    _tempHumManager->setup();
    _lightManager->setup();
}

String DeviceManager::getDeviceId() {
    return _deviceId;
}

String DeviceManager::getDeviceMode() {
    return _deviceMode;
}

void DeviceManager::setDeviceMode(String mode) {
    _deviceMode = mode;
    _saveConfig();
}

#include <time.h> // Include for time functions

String DeviceManager::getSensorData() {
    StaticJsonDocument<256> doc;
    doc["device_id"] = _deviceId;

    // Get current time and format it
    time_t now;
    struct tm timeinfo;
    time(&now);
    localtime_r(&now, &timeinfo); // Use localtime_r for timezone-adjusted time

    char formattedTime[20]; // YYYY-MM-DDTHH:MM:SS + null terminator
    strftime(formattedTime, sizeof(formattedTime), "%Y-%m-%dT%H:%M:%S", &timeinfo);
    doc["timestamp"] = formattedTime;

    JsonObject payload = doc.createNestedObject("payload");
    payload["temperature"] = _tempHumManager->getTemperature();
    payload["humidity"] = _tempHumManager->getHumidity();
    payload["light"] = _lightManager->getLightLevel();
    payload["weight"] = _scaleManager.getWeight();

    String output;
    serializeJson(doc, output);
    return output;
}

void DeviceManager::_loadConfig() {
    if (LittleFS.exists("/config.json")) {
        File configFile = LittleFS.open("/config.json", "r");
        StaticJsonDocument<256> doc;
        deserializeJson(doc, configFile);
        _deviceMode = doc["device_mode"] | "comedero";
        configFile.close();
    } else {
        _deviceMode = "comedero";
    }
}

void DeviceManager::_saveConfig() {
    File configFile = LittleFS.open("/config.json", "w");
    StaticJsonDocument<256> doc;
    doc["device_mode"] = _deviceMode;
    serializeJson(doc, configFile);
    configFile.close();
}
