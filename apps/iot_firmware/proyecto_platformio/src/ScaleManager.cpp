#include "ScaleManager.h"
#include "HX711.h"
#include <LittleFS.h>

// Define constants from the plan
const float WEIGHT_CHANGE_THRESHOLD = 5.0; // grams
const unsigned long EVENT_TIMEOUT = 30000; // 30 seconds
const unsigned long COOLDOWN_PERIOD = 5000; // 5 seconds

ScaleManager::ScaleManager(byte doutPin, byte sckPin)
    : _doutPin(doutPin), _sckPin(sckPin) {
    _scale = new HX711();
    _currentState = IDLE;
    _eventReady = false;
}

void ScaleManager::setup() {
    _scale->begin(_doutPin, _sckPin);
    if (LittleFS.exists("/scale_offset.txt")) {
        File offsetFile = LittleFS.open("/scale_offset.txt", "r");
        long offset = offsetFile.readString().toInt();
        _scale->set_offset(offset);
        offsetFile.close();
    }
    _scale->set_scale(); // Default scale factor
    tare();
    _lastWeight = _scale->get_units(10);
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
            // If the weight changes significantly, assume a pet has arrived.
            if (abs(currentWeight - _lastWeight) > WEIGHT_CHANGE_THRESHOLD) {
                Serial.println("Event Start: Weight change detected.");
                _currentState = PET_PRESENT;
                _initialWeight = _lastWeight; // Record weight before the event
                _eventStartTime = millis();
                _lastStableTime = millis();   // Reset stability timer
            }
            break;

        case PET_PRESENT:
            // Check if weight has been stable (no change) for the timeout duration
            if (abs(currentWeight - _lastWeight) < WEIGHT_CHANGE_THRESHOLD) {
                if (millis() - _lastStableTime > EVENT_TIMEOUT) {
                    Serial.println("Event End: Timeout reached.");
                    _lastEvent.amount_consumed_grams = _initialWeight - currentWeight;
                    // Ensure consumption is not negative
                    if (_lastEvent.amount_consumed_grams < 0) _lastEvent.amount_consumed_grams = 0;
                    
                    _lastEvent.duration_seconds = (millis() - _eventStartTime) / 1000;
                    _eventReady = true;
                    _currentState = COOLDOWN;
                    _lastStableTime = millis(); // Use for cooldown timing
                }
            } else {
                // Weight is actively changing, so reset the stability timer
                _lastStableTime = millis();
            }
            break;

        case COOLDOWN:
            if (millis() - _lastStableTime > COOLDOWN_PERIOD) {
                _currentState = IDLE;
            }
            break;
    }

    _lastWeight = currentWeight; // Update weight for the next reading
}
