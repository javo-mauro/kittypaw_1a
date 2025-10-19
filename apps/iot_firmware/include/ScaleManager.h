#ifndef SCALE_MANAGER_H
#define SCALE_MANAGER_H

#include <Arduino.h>

struct ConsumptionEvent {
    float amount_consumed_grams;
    unsigned long duration_seconds;
};

enum ScaleState { IDLE, DETECTING_CHANGE, PET_PRESENT, COOLDOWN };

class ScaleManager {
public:
    ScaleManager(byte doutPin, byte sckPin);
    void setup();
    void loop();
    void tare();
    bool getConsumptionEvent(ConsumptionEvent& event);

private:
    class HX711* _scale;
    ScaleState _currentState;
    float _initialWeight;
    unsigned long _eventStartTime;
    unsigned long _lastStableTime;
    ConsumptionEvent _lastEvent;
    bool _eventReady;

    void _updateState();
};

#endif
