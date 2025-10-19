#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <ESP8266WiFi.h>

class WiFiManager {
public:
    WiFiManager();
    void setup();
    void loop();
    bool isConnected();

private:
    String _ssid;
    String _password;
    unsigned long _lastReconnectAttempt = 0;
};

#endif
