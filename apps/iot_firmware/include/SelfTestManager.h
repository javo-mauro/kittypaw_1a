#ifndef SELF_TEST_MANAGER_H
#define SELF_TEST_MANAGER_H

#include <Arduino.h>

class SelfTestManager {
public:
    SelfTestManager();
    String runTests();

private:
    bool _testMemory();
    bool _testFileSystem();
    bool _testScale();
};

#endif
