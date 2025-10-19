#ifndef SELF_TEST_MANAGER_H
#define SELF_TEST_MANAGER_H

#include <Arduino.h>

class SelfTestManager {
public:
    SelfTestManager();
    String runTests();
};

#endif