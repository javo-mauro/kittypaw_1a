
#include "TemperatureHumidityManager.h"

TemperatureHumidityManager::TemperatureHumidityManager(uint8_t pin, uint8_t type)
    : _dht(pin, type), _pin(pin), _type(type) {}

void TemperatureHumidityManager::setup() {
    _dht.begin();
}

float TemperatureHumidityManager::getTemperature() {
    float t = _dht.readTemperature();
    return isnan(t) ? -999.0 : t; // Return a sentinel value on failure
}

float TemperatureHumidityManager::getHumidity() {
    float h = _dht.readHumidity();
    return isnan(h) ? -999.0 : h; // Return a sentinel value on failure
}
