#ifndef WEBSERVERMANAGER_H
#define WEBSERVERMANAGER_H

#include <WebServer.h>
#include <WebSocketsServer.h>
#include "CameraManager.h"
#include "ObjectDetector.h"
#include <vector>

class WebServerManager {
public:
    WebServerManager(CameraManager& cameraManager, ObjectDetector* objectDetector);
    void setup();
    void loop();
    void sendDetectionResults(const std::vector<detection_t>& detections);

private:
    WebServer server;
    WebSocketsServer webSocket;
    CameraManager& cameraManager;
    ObjectDetector* _objectDetector;

    void handleRoot();
    void handleStream();
    void handleDetector();
    void handleNotFound();
    void onWebSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length);
};

#endif // WEBSERVERMANAGER_H
