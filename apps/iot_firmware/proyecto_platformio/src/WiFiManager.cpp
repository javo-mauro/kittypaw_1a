#include "WiFiManager.h"
#include <WiFi.h>
#include <LittleFS.h>
#include <ArduinoJson.h>

WiFiManager::WiFiManager() : _lastReconnectAttempt(0) {}

void WiFiManager::setup() {
    Serial.println("WiFi Manager setup.");
    if (LittleFS.exists("/wifi.json")) {
        Serial.println("wifi.json exists.");
        File configFile = LittleFS.open("/wifi.json", "r");
        if (!configFile) {
            Serial.println("Failed to open wifi.json for reading.");
            return;
        }
        StaticJsonDocument<512> doc; // Increased size for array
        DeserializationError error = deserializeJson(doc, configFile);
        if (error) {
            Serial.print("deserializeJson() failed: ");
            Serial.println(error.c_str());
            configFile.close();
            return;
        }
        configFile.close(); // Close after deserialization

        if (doc.isNull()) {
            Serial.println("Deserialized JSON document is null.");
            return;
        }

        if (!doc.containsKey("networks")) {
            Serial.println("wifi.json does not contain 'networks' key.");
            return;
        }

        JsonArray networksArray = doc["networks"].as<JsonArray>();
        if (networksArray.isNull()) {
            Serial.println("'networks' is not an array or is null.");
            return;
        }

        Serial.print("Found ");
        Serial.print(networksArray.size());
        Serial.println(" networks in wifi.json.");

        for (JsonObject network : networksArray) {
            _knownNetworks.push_back({network["ssid"].as<String>(), network["password"].as<String>()});
        }
        Serial.println("WiFi credentials loaded into _knownNetworks.");
    } else {
        Serial.println("wifi.json not found. Starting with no known networks.");
        // Optionally add a default network here if desired
    }

    WiFi.mode(WIFI_STA);
    // Initial connection attempt is handled in loop()
    _lastReconnectAttempt = millis(); // Initialize timer
}

void WiFiManager::loop() {
    if (WiFi.status() == WL_CONNECTED) {
        if (!_connected) {
            _connected = true;
            Serial.print("WiFi connected! IP address: ");
            Serial.println(WiFi.localIP());
        }
        return;
    }

    _connected = false;
    unsigned long now = millis();
    if (now - _lastReconnectAttempt > 5000) { // 5 second timeout for each network
        _lastReconnectAttempt = now;

        if (_knownNetworks.empty()) {
            return;
        }

        _currentNetworkIndex = (_currentNetworkIndex + 1) % _knownNetworks.size();
        const WifiNetwork& net = _knownNetworks[_currentNetworkIndex];

        Serial.print("Attempting to connect to WiFi (SSID: ");
        Serial.print(net.ssid);
        Serial.println(")...");
        _connectToNetwork(net.ssid, net.password);
    }
}

bool WiFiManager::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}

void WiFiManager::_connectToNetwork(const String& ssid, const String& password) {
    WiFi.disconnect();
    WiFi.begin(ssid.c_str(), password.c_str());
}

void WiFiManager::_saveNetworks() {
    File configFile = LittleFS.open("/wifi.json", "w");
    if (!configFile) {
        Serial.println("Failed to open config file for writing.");
        return;
    }

    StaticJsonDocument<512> doc;
    JsonArray networksArray = doc.createNestedArray("networks");
    for (const auto& net : _knownNetworks) {
        JsonObject network = networksArray.createNestedObject(); // Corrected line
        network["ssid"] = net.ssid;
        network["password"] = net.password;
    }

    if (serializeJson(doc, configFile) == 0) {
        Serial.println("Failed to write to config file.");
    }
    configFile.close();
}
