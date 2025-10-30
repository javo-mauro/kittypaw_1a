#include "WebServerManager.h"
#include "LittleFS.h"
#include <ArduinoJson.h>

WebServerManager::WebServerManager(CameraManager& cameraManager, ObjectDetector* objectDetector)
    : server(80), webSocket(81), cameraManager(cameraManager), _objectDetector(objectDetector) {}

void WebServerManager::setup() {
    server.on("/", HTTP_GET, [this]() { this->handleRoot(); });
    server.on("/stream", HTTP_GET, [this]() { this->handleStream(); });
    server.on("/detector", HTTP_GET, [this]() { this->handleDetector(); });
    server.onNotFound([this]() { this->handleNotFound(); });

    server.begin();
    Serial.println("HTTP server started");

    webSocket.begin();
    webSocket.onEvent([this](uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
        this->onWebSocketEvent(num, type, payload, length);
    });
    Serial.println("WebSocket server started");
}

void WebServerManager::loop() {
    server.handleClient();
    webSocket.loop();
}

void WebServerManager::handleRoot() {
    String html = "<html><head><title>ESP32-CAM</title></head><body>";
    html += "<h1>ESP32-CAM</h1>";
    html += "<p><a href='/detector'>Object Detector</a></p>";
    html += "</body></html>";
    server.send(200, "text/html", html);
}

void WebServerManager::handleDetector() {
    if (LittleFS.exists("/detector.html")) {
        File file = LittleFS.open("/detector.html", "r");
        server.streamFile(file, "text/html");
        file.close();
    } else {
        server.send(404, "text/plain", "detector.html not found");
    }
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

void WebServerManager::onWebSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.printf("[%u] Disconnected!\n", num);
            break;
        case WStype_CONNECTED:
            {
                IPAddress ip = webSocket.remoteIP(num);
                Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
            }
            break;
        case WStype_TEXT:
            Serial.printf("[%u] get Text: %s\n", num, payload);
            if (payload[0] == '#') {
                // For now, we only support setting the target
            } else {
                _objectDetector->setTarget((char*)payload);
            }
            break;
        case WStype_BIN:
        case WStype_ERROR:
        case WStype_FRAGMENT_TEXT_START:
        case WStype_FRAGMENT_BIN_START:
        case WStype_FRAGMENT:
        case WStype_FRAGMENT_FIN:
            break;
    }
}

void WebServerManager::sendDetectionResults(const std::vector<detection_t>& detections) {
    if (detections.empty()) {
        return;
    }

    StaticJsonDocument<1024> doc;
    JsonArray boxes = doc.createNestedArray("boxes");

    for (const auto& detection : detections) {
        JsonObject box = boxes.createNestedObject();
        box["label"] = detection.label;
        box["value"] = detection.value;
        box["x"] = detection.x;
        box["y"] = detection.y;
        box["w"] = detection.w;
        box["h"] = detection.h;
    }

    String json;
    serializeJson(doc, json);
    webSocket.broadcastTXT(json);
}

void WebServerManager::handleNotFound() {
    server.send(404, "text/plain", "Not found");
}
