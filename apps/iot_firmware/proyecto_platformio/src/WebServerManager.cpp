#include "WebServerManager.h"

WebServerManager::WebServerManager(CameraManager& cameraManager) : server(80), cameraManager(cameraManager) {}

void WebServerManager::setup() {
    server.on("/", HTTP_GET, [this]() { this->handleRoot(); });
    server.on("/stream", HTTP_GET, [this]() { this->handleStream(); });
    server.onNotFound([this]() { this->handleNotFound(); });

    server.begin();
    Serial.println("HTTP server started");
}

void WebServerManager::loop() {
    server.handleClient();
}

void WebServerManager::handleRoot() {
    String html = "<html><head><title>ESP32-CAM Stream</title></head><body>";
    html += "<h1>ESP32-CAM Stream</h1>";
    html += "<img src=\"/stream\" style=\"width:100%\">";
    html += "</body></html>";
    server.send(200, "text/html", html);
}

void WebServerManager::handleStream() {
    WiFiClient client = server.client();
    String boundary = "--frame";
    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: multipart/x-mixed-replace; boundary=" + boundary);
    client.println();

    while (true) {
        camera_fb_t* fb = cameraManager.getFrame();
        if (!fb) {
            Serial.println("Failed to capture frame");
            continue;
        }

        client.println("--" + boundary);
        client.println("Content-Type: image/jpeg");
        client.println("Content-Length: " + String(fb->len));
        client.println();
        client.write(fb->buf, fb->len);
        client.println();

        cameraManager.returnFrame(fb);

        if (!client.connected()) {
            break;
        }
    }
}

void WebServerManager::handleNotFound() {
    server.send(404, "text/plain", "Not found");
}

