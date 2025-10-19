#ifndef MQTT_MANAGER_H
#define MQTT_MANAGER_H

#include <Arduino.h>
#include "ScaleManager.h"

class MqttManager {
public:
    MqttManager(const char* awsEndpoint);
    void setup(String deviceId);
    void loop();
    bool isConnected();
    void publishConsumptionEvent(const ConsumptionEvent& event, String deviceMode);
    void publishHealthReport(String report);

private:
    class WiFiClientSecure* _wifiClient;
    class PubSubClient* _mqttClient;
    const char* _awsEndpoint;
    String _deviceId;

    void _connect();
    void _callback(char* topic, byte* payload, unsigned int length);
};

#endif
