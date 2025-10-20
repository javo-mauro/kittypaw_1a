#ifndef MQTT_MANAGER_H
#define MQTT_MANAGER_H

#include <Arduino.h>
#include "ScaleManager.h"
#include "DeviceManager.h"
#include <WiFiClient.h>

class MqttManager {
public:
    MqttManager(DeviceManager& deviceManager, const char* brokerIp);
    void setup(String deviceId);
    void loop();
    bool isConnected();
    void publishConsumptionEvent(const ConsumptionEvent& event, String deviceMode);
    void publishHealthReport(String report);
    void publishSensorData(String data);

private:
    DeviceManager& _deviceManager;
    WiFiClient _wifiClient;
    class PubSubClient* _mqttClient;
    const char* _brokerIp;
    String _deviceId;

    void _connect();
    void _callback(char* topic, byte* payload, unsigned int length);
};

#endif
