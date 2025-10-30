#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <vector>

class WiFiManager {
public:
    WiFiManager();
    void setup();
    void loop();
    bool isConnected();

private:
    struct WifiNetwork {
        String ssid;
        String password;
    };
    std::vector<WifiNetwork> _knownNetworks;
    unsigned long _lastReconnectAttempt = 0;
    int _currentNetworkIndex = -1; // Index of the currently connected network
    bool _connected = false;

    void _connectToNetwork(const String& ssid, const String& password);
    void _saveNetworks(); // New function to save known networks to LittleFS
};

#endif
