#include "MqttManager.h"
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <WiFiClient.h>

MqttManager::MqttManager(DeviceManager& deviceManager, const char* brokerIp)
    : _deviceManager(deviceManager), _brokerIp(brokerIp) {
    _mqttClient = new PubSubClient(_wifiClient);
}

void MqttManager::setup(String deviceId) {
    _deviceId = deviceId;
    _mqttClient->setServer(_brokerIp, 1883); // Standard MQTT port
    _mqttClient->setCallback([this](char* topic, byte* payload, unsigned int length) {
        this->_callback(topic, payload, length);
    });
}

void MqttManager::loop() {
    if (!_mqttClient->connected()) {
        _connect();
    }
    _mqttClient->loop();
}

bool MqttManager::isConnected() {
    return _mqttClient->connected();
}

void MqttManager::publishConsumptionEvent(const ConsumptionEvent& event, String deviceMode) {
    StaticJsonDocument<256> doc;
    doc["deviceId"] = _deviceId;
    doc["eventType"] = "consumo";
    JsonObject payload = doc.createNestedObject("payload");
    payload["mode"] = deviceMode;
    payload["duration_seconds"] = event.duration_seconds;
    payload["amount_consumed_grams"] = event.amount_consumed_grams;

    char buffer[256];
    serializeJson(doc, buffer);
    _mqttClient->publish("kittypaw/events", buffer);
}

void MqttManager::publishHealthReport(String report) {
    _mqttClient->publish("kittypaw/reports/health", report.c_str());
}

void MqttManager::publishSensorData(String data) {
    _mqttClient->publish("KPCL0022/pub", data.c_str());
}

void MqttManager::_connect() {
    Serial.println("Connecting to MQTT...");
    while (!_mqttClient->connected()) {
        if (_mqttClient->connect(_deviceId.c_str())) {
            Serial.println("MQTT connected");
            String commandTopic = "kittypaw/commands/" + _deviceId;
            _mqttClient->subscribe(commandTopic.c_str());
        } else {
            Serial.print("failed, rc=");
            Serial.print(_mqttClient->state());
            Serial.println(" try again in 5 seconds");
            delay(5000);
        }
    }
}

void MqttManager::_callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Command received on topic: ");
    Serial.println(topic);

    StaticJsonDocument<256> doc;
    deserializeJson(doc, payload, length);

    if (doc.containsKey("device_mode")) {
        String mode = doc["device_mode"];
        Serial.println("Received new device mode: " + mode);
        _deviceManager.setDeviceMode(mode);
    } else {
        Serial.println("Command does not contain 'device_mode' key.");
    }
}
