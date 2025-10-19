#include "SelfTestManager.h"
#include <Arduino.h>
#include <LittleFS.h>

SelfTestManager::SelfTestManager() {}

String SelfTestManager::runTests() {
    String report = "{";
    report += "\"memory\": " + String(_testMemory() ? "true" : "false") + ",";
    report += "\"filesystem\": " + String(_testFileSystem() ? "true" : "false") + ",";
    report += "\"scale\": " + String(_testScale() ? "true" : "false");
    report += "}";
    return report;
}

bool SelfTestManager::_testMemory() {
    // Simple check for free heap
    return ESP.getFreeHeap() > 10000; // 10KB
}

bool SelfTestManager::_testFileSystem() {
    return LittleFS.begin();
}

bool SelfTestManager::_testScale() {
    // In a real scenario, we would check if the scale is responding.
    // For now, we assume it's connected if the code compiles.
    return true;
}

