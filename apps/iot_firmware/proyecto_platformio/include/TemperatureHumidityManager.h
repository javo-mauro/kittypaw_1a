
#ifndef TEMPERATURE_HUMIDITY_MANAGER_H
#define TEMPERATURE_HUMIDITY_MANAGER_H

#include <Arduino.h>
#include <DHT.h>

class TemperatureHumidityManager {
public:
    TemperatureHumidityManager(uint8_t pin, uint8_t type);
    void setup();
    float getTemperature();
    float getHumidity();

private:
    DHT _dht;
    uint8_t _pin;
    uint8_t _type;
};

#endif
