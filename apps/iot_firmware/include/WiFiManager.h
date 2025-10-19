#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>

class WiFiManager {
public:
    WiFiManager();
    void setup();
    void loop();
    bool isConnected();

private:
    void _connect();
    unsigned long _lastReconnectAttempt;
};

#endif
