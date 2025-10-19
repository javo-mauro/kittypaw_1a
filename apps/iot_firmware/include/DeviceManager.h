#ifndef DEVICE_MANAGER_H
#define DEVICE_MANAGER_H

#include <Arduino.h>

class DeviceManager {
public:
    DeviceManager();
    void setup();
    String getDeviceId();
    String getDeviceMode();
    void setDeviceMode(String mode);

private:
    String _deviceId;
    String _deviceMode;
    void _loadConfig();
    void _saveConfig();
};

#endif
