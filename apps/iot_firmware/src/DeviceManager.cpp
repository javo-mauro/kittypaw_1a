#include "DeviceManager.h"
#include <LittleFS.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>

DeviceManager::DeviceManager() {}

void DeviceManager::setup() {
    // Generate device ID from MAC address
    _deviceId = "KP-" + WiFi.macAddress();
    _deviceId.replace(":", "");

    _loadConfig();
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
