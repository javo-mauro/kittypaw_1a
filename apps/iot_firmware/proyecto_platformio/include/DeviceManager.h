#ifndef DEVICE_MANAGER_H
#define DEVICE_MANAGER_H

#include <Arduino.h>
#include "TemperatureHumidityManager.h"
#include "LightManager.h"
#include "ScaleManager.h"

class DeviceManager {
public:
    DeviceManager(ScaleManager& scaleManager);
    void setup();
    String getDeviceId();
    String getDeviceMode();
    void setDeviceMode(String mode);
    String getSensorData();

private:
    String _deviceId;
    String _deviceMode;
    ScaleManager& _scaleManager;
    TemperatureHumidityManager* _tempHumManager;
    LightManager* _lightManager;
    void _loadConfig();
    void _saveConfig();
};

#endif
