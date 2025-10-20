#include "ScaleManager.h"
#include <HX711_ADC.h>
#include <LittleFS.h>

// Define constants from the plan
const float WEIGHT_CHANGE_THRESHOLD = 5.0; // grams
const unsigned long EVENT_TIMEOUT = 30000; // 30 seconds
const unsigned long COOLDOWN_PERIOD = 5000; // 5 seconds
const int CALIBRATION_FACTOR = 4198; // From legacy code

ScaleManager::ScaleManager(byte doutPin, byte sckPin)
    : _doutPin(doutPin), _sckPin(sckPin) {
    _scale = new HX711_ADC(_doutPin, _sckPin);
    _currentState = IDLE;
    _eventReady = false;
    _lastWeight = 0;
}

void ScaleManager::setup() {
    _scale->begin();
    _scale->setCalFactor(CALIBRATION_FACTOR);
    // Start the scale, wait 2 seconds for settling, and initiate a tare
    _scale->start(2000, true);
    Serial.println("Scale setup complete. Waiting for tare...");
}

void ScaleManager::loop() {
    // 1. Always call update. It drives the whole process.
    _scale->update();

    // 2. Announce tare completion once.
    static bool tareAnnounced = false;
    if (!tareAnnounced && _scale->getTareStatus() == true) {
        Serial.println("Tare complete.");
        tareAnnounced = true;
    }

    // 3. If tare is complete, get the latest data and run the state machine.
    if (_scale->getTareStatus() == true) {
        float currentWeight = _scale->getData();
        _updateState(currentWeight);
    }
}

void ScaleManager::tare() {
    _scale->tareNoDelay();
}

bool ScaleManager::getConsumptionEvent(ConsumptionEvent& event) {
    if (_eventReady) {
        event = _lastEvent;
        _eventReady = false;
        return true;
    }
    return false;
}

float ScaleManager::getWeight() {
    return _lastWeight;
}

void ScaleManager::_updateState(float currentWeight) {
    switch (_currentState) {
        case IDLE:
            if (abs(currentWeight - _lastWeight) > WEIGHT_CHANGE_THRESHOLD) {
                Serial.println("Event Start: Weight change detected.");
                _currentState = PET_PRESENT;
                _initialWeight = _lastWeight; 
                _eventStartTime = millis();
                _lastStableTime = millis();
            }
            break;

        case PET_PRESENT:
            if (abs(currentWeight - _lastWeight) < WEIGHT_CHANGE_THRESHOLD) {
                if (millis() - _lastStableTime > EVENT_TIMEOUT) {
                    Serial.println("Event End: Timeout reached.");
                    _lastEvent.amount_consumed_grams = _initialWeight - currentWeight;
                    if (_lastEvent.amount_consumed_grams < 0) _lastEvent.amount_consumed_grams = 0;
                    
                    _lastEvent.duration_seconds = (millis() - _eventStartTime) / 1000;
                    _eventReady = true;
                    _currentState = COOLDOWN;
                    _lastStableTime = millis();
                }
            }
            else {
                _lastStableTime = millis();
            }
            break;

        case COOLDOWN:
            if (millis() - _lastStableTime > COOLDOWN_PERIOD) {
                _currentState = IDLE;
            }
            break;
    }

    _lastWeight = currentWeight;
}

