#ifndef WEBSERVERMANAGER_H
#define WEBSERVERMANAGER_H

#include <WebServer.h>
#include "CameraManager.h"

class WebServerManager {
public:
    WebServerManager(CameraManager& cameraManager);
    void setup();
    void loop();

private:
    WebServer server;
    CameraManager& cameraManager;

    void handleRoot();
    void handleStream();
    void handleNotFound();
};

#endif // WEBSERVERMANAGER_H
