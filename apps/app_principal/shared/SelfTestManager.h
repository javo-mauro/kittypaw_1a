#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>

// Incluimos las cabeceras de los módulos que vamos a probar
#include "DeviceManager.h"
#include "ScaleManager.h"
// #include "DhtManager.h" // Se necesitará un módulo para el sensor DHT

class SelfTestManager {
public:
  // El constructor recibe referencias a los módulos que necesita para las pruebas.
  SelfTestManager(DeviceManager& deviceManager, ScaleManager& scaleManager);

  // Ejecuta todas las pruebas y construye el objeto JSON interno.
  void runTests();

  // Genera el string final del reporte JSON para ser enviado por MQTT.
  String getReportJson();

private:
  // Referencias a los módulos externos
  DeviceManager& _deviceManager;
  ScaleManager& _scaleManager;

  // Documento JSON para construir el reporte
  StaticJsonDocument<512> _jsonReport;
  bool _overallStatus;

  // Métodos privados, uno para cada prueba específica
  void _testFilesystem();
  void _testWifiHardware();
  void _testSensorHx711();
  void _testSensorDht();
  void _testNtpSync();
};