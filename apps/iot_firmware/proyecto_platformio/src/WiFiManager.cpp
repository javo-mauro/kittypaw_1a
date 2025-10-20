#include "WiFiManager.h"
#include <ESP8266WiFi.h>
#include <LittleFS.h>
#include <ArduinoJson.h>

WiFiManager::WiFiManager() : _lastReconnectAttempt(0) {}

void WiFiManager::setup() {
    Serial.println("WiFi Manager setup.");
    if (LittleFS.exists("/wifi.json")) {
        File configFile = LittleFS.open("/wifi.json", "r");
        StaticJsonDocument<256> doc;
        deserializeJson(doc, configFile);
        _ssid = doc["ssid"].as<String>();
        _password = doc["password"].as<String>();
        configFile.close();
        Serial.println("WiFi credentials loaded.");
    } else {
        Serial.println("wifi.json not found. Using default credentials.");
        _ssid = "default_ssid";
        _password = "default_password";
    }

    WiFi.mode(WIFI_STA);
    // Initial connection attempt is handled in loop()
    _lastReconnectAttempt = millis(); // Initialize timer
}

void WiFiManager::loop() {
    if (WiFi.status() == WL_CONNECTED) {
        return; // Already connected
    }

    unsigned long now = millis();
    if (now - _lastReconnectAttempt > 5000) { // Try to connect every 5 seconds
        _lastReconnectAttempt = now;
        Serial.print("Connecting to WiFi (SSID: ");
        Serial.print(_ssid);
        Serial.println(")...");
        WiFi.disconnect(); // Disconnect before trying to connect again
        WiFi.begin(_ssid.c_str(), _password.c_str());
    }
}

bool WiFiManager::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}
