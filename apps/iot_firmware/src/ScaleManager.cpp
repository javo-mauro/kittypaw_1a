#include "ScaleManager.h"
#include "HX711.h"
#include <LittleFS.h>

// Define constants from the plan
const float WEIGHT_CHANGE_THRESHOLD = 5.0; // grams
const unsigned long EVENT_TIMEOUT = 30000; // 30 seconds
const unsigned long COOLDOWN_PERIOD = 5000; // 5 seconds

ScaleManager::ScaleManager(byte doutPin, byte sckPin) {
    _scale = new HX711(doutPin, sckPin);
    _currentState = IDLE;
    _eventReady = false;
}

void ScaleManager::setup() {
    if (LittleFS.exists("/scale_offset.txt")) {
        File offsetFile = LittleFS.open("/scale_offset.txt", "r");
        long offset = offsetFile.readString().toInt();
        _scale->set_offset(offset);
        offsetFile.close();
    }
    _scale->set_scale(); // Default scale factor
    tare();
}

void ScaleManager::loop() {
    _updateState();
}

void ScaleManager::tare() {
    _scale->tare();
    File offsetFile = LittleFS.open("/scale_offset.txt", "w");
    offsetFile.print(_scale->get_offset());
    offsetFile.close();
}

bool ScaleManager::getConsumptionEvent(ConsumptionEvent& event) {
    if (_eventReady) {
        event = _lastEvent;
        _eventReady = false;
        return true;
    }
    return false;
}

void ScaleManager::_updateState() {
    float currentWeight = _scale->get_units(10);

    switch (_currentState) {
        case IDLE:
            if (abs(currentWeight) > WEIGHT_CHANGE_THRESHOLD) {
                _currentState = PET_PRESENT;
                _initialWeight = currentWeight;
                _eventStartTime = millis();
                _lastStableTime = millis();
            }
            break;

        case PET_PRESENT:
            if (abs(currentWeight - _initialWeight) < WEIGHT_CHANGE_THRESHOLD) {
                 if (millis() - _lastStableTime > EVENT_TIMEOUT) {
                    // Event finished
                    _lastEvent.amount_consumed_grams = _initialWeight - currentWeight;
                    _lastEvent.duration_seconds = (millis() - _eventStartTime) / 1000;
                    _eventReady = true;
                    _currentState = COOLDOWN;
                    _lastStableTime = millis(); // Start cooldown timer
                 }
            } else {
                _lastStableTime = millis();
            }
            break;

        case COOLDOWN:
            if (millis() - _lastStableTime > COOLDOWN_PERIOD) {
                _currentState = IDLE;
            }
            break;
    }
}
