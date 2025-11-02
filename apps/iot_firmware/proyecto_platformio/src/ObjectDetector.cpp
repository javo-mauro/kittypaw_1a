#include "ObjectDetector.h"
#include "Jdayne-project-1_inferencing.h"
#include "edge-impulse-sdk/dsp/image/image.hpp"
#include "Arduino.h"

// Static variables from esp32_camera.ino
static bool debug_nn = false;
static bool is_initialised = false;
static uint8_t *snapshot_buf = nullptr;

// Helper function from esp32_camera.ino
static int ei_camera_get_data(size_t offset, size_t length, float *out_ptr)
{
    size_t pixel_ix = offset * 3;
    size_t pixels_left = length;
    size_t out_ptr_ix = 0;
    while (pixels_left != 0) {
        out_ptr[out_ptr_ix] = (snapshot_buf[pixel_ix + 2] << 16) + (snapshot_buf[pixel_ix + 1] << 8) + snapshot_buf[pixel_ix];
        out_ptr_ix++;
        pixel_ix+=3;
        pixels_left--;
    }
    return 0;
}

ObjectDetector::ObjectDetector(QueueHandle_t queue) : _queue(queue) {
    _target = "all";
}

bool ObjectDetector::init() {
    // Camera is initialized by CameraManager, so we just set is_initialised to true
    is_initialised = true;
    return true;
}

void ObjectDetector::setTarget(std::string target) {
    _target = target;
}

void ObjectDetector::run() {
    if (!is_initialised) {
        return;
    }

    snapshot_buf = (uint8_t*)malloc(EI_CLASSIFIER_INPUT_WIDTH * EI_CLASSIFIER_INPUT_HEIGHT * 3);
    if(snapshot_buf == nullptr) {
        ei_printf("ERR: Failed to allocate snapshot buffer!\n");
        return;
    }

    ei::signal_t signal;
    signal.total_length = EI_CLASSIFIER_INPUT_WIDTH * EI_CLASSIFIER_INPUT_HEIGHT;
    signal.get_data = &ei_camera_get_data;

    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
        ei_printf("Camera capture failed\n");
        free(snapshot_buf);
        return;
    }

    bool converted = fmt2rgb888(fb->buf, fb->len, PIXFORMAT_JPEG, snapshot_buf);
    esp_camera_fb_return(fb);

    if(!converted){
       ei_printf("Conversion failed\n");
       free(snapshot_buf);
       return;
    }

    ei_impulse_result_t result = { 0 };
    EI_IMPULSE_ERROR err = run_classifier(&signal, &result, debug_nn);
    if (err != EI_IMPULSE_OK) {
        ei_printf("ERR: Failed to run classifier (%d)\n", err);
        free(snapshot_buf);
        return;
    }

    for (uint32_t i = 0; i < result.bounding_boxes_count; i++) {
        ei_impulse_result_bounding_box_t bb = result.bounding_boxes[i];
        if (bb.value >= EI_CLASSIFIER_OBJECT_DETECTION_THRESHOLD) {
            if (_target == "all" || _target == bb.label) {
                detection_t detection;
                strncpy(detection.label, bb.label, sizeof(detection.label) - 1);
                detection.label[sizeof(detection.label) - 1] = '\0';
                detection.value = bb.value;
                detection.x = bb.x;
                detection.y = bb.y;
                detection.w = bb.width;
                detection.h = bb.height;
                xQueueSend(_queue, &detection, portMAX_DELAY);
            }
        }
    }
    free(snapshot_buf);}
