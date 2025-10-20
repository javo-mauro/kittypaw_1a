
#include "LightManager.h"

LightManager::LightManager(uint8_t pin) : _pin(pin) {}

void LightManager::setup() {
    pinMode(_pin, INPUT);
}

float LightManager::getLightLevel() {
    int lightValue = analogRead(_pin);
    // Mapping from legacy code: 0-1023 to 0-500 lux
    float light = map(lightValue, 0, 1023, 0, 500);
    return light;
}
