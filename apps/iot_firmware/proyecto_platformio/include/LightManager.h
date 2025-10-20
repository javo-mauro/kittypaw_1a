
#ifndef LIGHT_MANAGER_H
#define LIGHT_MANAGER_H

#include <Arduino.h>

class LightManager {
public:
    LightManager(uint8_t pin);
    void setup();
    float getLightLevel();

private:
    uint8_t _pin;
};

#endif
