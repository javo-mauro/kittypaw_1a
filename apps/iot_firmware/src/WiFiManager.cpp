#include "WiFiManager.h"
#include <ESP8266WiFi.h>
#include <LittleFS.h>
#include <ArduinoJson.h>

WiFiManager::WiFiManager() : _lastReconnectAttempt(0) {}

void WiFiManager::setup() {
    _connect();
}

void WiFiManager::loop() {
    if (WiFi.status() != WL_CONNECTED) {
        unsigned long now = millis();
        if (now - _lastReconnectAttempt > 5000) { // Reconnect every 5 seconds
            _lastReconnectAttempt = now;
            _connect();
        }
    }
}

bool WiFiManager::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}

void WiFiManager::_connect() {
    Serial.println("Connecting to WiFi...");
    if (LittleFS.exists("/wifi.json")) {
        File configFile = LittleFS.open("/wifi.json", "r");
        StaticJsonDocument<256> doc;
        deserializeJson(doc, configFile);
        const char* ssid = doc["ssid"];
        const char* password = doc["password"];
        WiFi.begin(ssid, password);
        configFile.close();
    } else {
        Serial.println("wifi.json not found, using default credentials.");
        // Default credentials if file doesn't exist
        WiFi.begin("default_ssid", "default_password");
    }
}
