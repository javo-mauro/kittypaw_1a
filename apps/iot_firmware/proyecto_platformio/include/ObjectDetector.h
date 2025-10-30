#ifndef OBJECTDETECTOR_H
#define OBJECTDETECTOR_H


#include "esp_camera.h"
#include <string>
#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"

// Define a struct to hold detection results
typedef struct {
    char label[32];
    float value;
    uint32_t x;
    uint32_t y;
    uint32_t w;
    uint32_t h;
} detection_t;

class ObjectDetector {
public:
    ObjectDetector(QueueHandle_t queue);
    bool init();
    void run();
    void setTarget(std::string target);

private:
    std::string _target;
    QueueHandle_t _queue;
    // Mutex for thread-safe access to _target
    // For now, we will rely on atomic operations on std::string being safe enough.
};

#endif // OBJECTDETECTOR_H
