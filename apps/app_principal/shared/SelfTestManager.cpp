#include "SelfTestManager.h"
#include <LittleFS.h>
#include <WiFi.h>
#include <time.h>

#define FIRMWARE_VERSION "1.0.0-post" // Definir la versión del firmware

SelfTestManager::SelfTestManager(DeviceManager& deviceManager, ScaleManager& scaleManager)
  : _deviceManager(deviceManager), _scaleManager(scaleManager) {
}

void SelfTestManager::runTests() {
  Serial.println("-> Iniciando pruebas de diagnóstico...");
  _jsonReport.clear();
  _overallStatus = true; // Asumimos que todo está bien al principio

  JsonObject results = _jsonReport.createNestedObject("results");

  // Ejecutar cada prueba
  _testFilesystem();
  _testWifiHardware();
  _testSensorHx711();
  _testSensorDht();
  _testNtpSync();

  Serial.println("-> Pruebas de diagnóstico finalizadas.");
}

String SelfTestManager::getReportJson() {
  // Añadir los campos finales al reporte
  _jsonReport["reportType"] = "self_test";
  _jsonReport["deviceId"] = _deviceManager.getDeviceID();
  _jsonReport["firmwareVersion"] = FIRMWARE_VERSION;
  _jsonReport["overallStatus"] = _overallStatus ? "PASS" : "FAIL";
  
  // Obtener timestamp en formato ISO 8601
  char timeStr[32];
  time_t now = time(nullptr);
  strftime(timeStr, sizeof(timeStr), "%Y-%m-%dT%H:%M:%SZ", gmtime(&now));
  _jsonReport["timestamp"] = timeStr;

  String output;
  serializeJson(_jsonReport, output);
  return output;
}

// --- Implementación de las Pruebas Individuales ---

void SelfTestManager::_testFilesystem() {
  JsonObject fs_results = _jsonReport["results"].createNestedObject("filesystem");
  // Lógica de prueba: Verificar si LittleFS está montado.
  // bool success = LittleFS.begin();
  // if (success) { ... }
  fs_results["status"] = "PENDING";
  fs_results["details"] = "Test no implementado";
}

void SelfTestManager::_testWifiHardware() {
  JsonObject wifi_results = _jsonReport["results"].createNestedObject("wifi_hardware");
  // Lógica de prueba: Verificar si el módulo WiFi se inicializa.
  // bool success = WiFi.mode(WIFI_STA);
  // if (success) { ... }
  wifi_results["status"] = "PENDING";
  wifi_results["details"] = "Test no implementado";
}

void SelfTestManager::_testSensorHx711() {
  JsonObject hx711_results = _jsonReport["results"].createNestedObject("sensor_hx711");
  // Lógica de prueba: Usar el método is_ready() del ScaleManager.
  // bool success = _scaleManager.is_ready();
  // if (success) { ... }
  hx711_results["status"] = "PENDING";
  hx711_results["details"] = "Test no implementado";
}

void SelfTestManager::_testSensorDht() {
  JsonObject dht_results = _jsonReport["results"].createNestedObject("sensor_dht");
  // Lógica de prueba: Intentar leer el sensor y ver si no es NaN.
  // float temp = dht.readTemperature();
  // if (!isnan(temp)) { ... }
  dht_results["status"] = "FAIL";
  dht_results["details"] = "Sensor no presente en el hardware actual";
  _overallStatus = false; // Marcamos fallo porque sabemos que no está.
}

void SelfTestManager::_testNtpSync() {
  JsonObject ntp_results = _jsonReport["results"].createNestedObject("ntp_sync");
  // Lógica de prueba: Verificar si el tiempo es válido.
  // time_t now = time(nullptr);
  // if (now > 8 * 3600 * 2) { ... }
  ntp_results["status"] = "PENDING";
  ntp_results["details"] = "Test no implementado";
}