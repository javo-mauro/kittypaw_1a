# Diseño Técnico Integral del Firmware KittyPaw

**Versión:** 1.0
**Estado:** Propuesta

## 1. Introducción

Este documento sirve como el plano técnico y la única fuente de verdad para el desarrollo del nuevo firmware del dispositivo KittyPaw. El objetivo es migrar de un código monolítico en un archivo `.ino` a una arquitectura modular, profesional y escalable utilizando PlatformIO y un diseño orientado a objetos.

---

## 2. Fase 1: Reestructuración del Proyecto

Esta fase ya ha sido completada y consistió en preparar el directorio `apps/iot_firmware/` para un desarrollo moderno.

1.  **Creación de Carpetas:** Se crearon las carpetas `src`, `lib`, y `_legacy_code`.
    *   `src`: Contendrá el código fuente principal (`main.cpp`).
    *   `lib`: Contendrá los módulos o clases reutilizables de nuestra aplicación.
    *   `_legacy_code`: Funciona como archivo para el código `.ino` original.
2.  **Migración de Código Antiguo:** El archivo `KPCL0022_Gem_1a.ino` fue movido a la carpeta `_legacy_code` para preservarlo como referencia histórica.

---

## 3. Fase 2: Diseño Detallado de Módulos

Cada módulo se diseñará como una clase de C++ con una única responsabilidad, ubicada en su propia subcarpeta dentro de `lib/`.

### 3.1. Módulo `ScaleManager`

*   **Propósito:** Encapsula toda la lógica del sensor de peso y la detección de eventos de consumo.
*   **Librería Clave:** `olkal/HX711_ADC`. Esta librería fue seleccionada específicamente por su arquitectura no bloqueante, que es esencial para la estabilidad del ESP8266 en aplicaciones de red.
*   **Ubicación:** `src/` y `include/` (como parte de la arquitectura de PlatformIO).
*   **Estado:** Implementado
*   **Lógica de Implementación:** El `loop()` del manager llama a `_scale->update()` continuamente. La inicialización y la tara (calibración a cero) se realizan de forma no bloqueante al arranque para no interferir con la conexión WiFi y MQTT.

### 3.2. Módulos de Sensores Ambientales

*   **Propósito:** Se crearon `TemperatureHumidityManager` y `LightManager` para encapsular la lógica de los sensores DHT11 y LDR, respectivamente, siguiendo el mismo patrón de diseño modular.
*   **Estado:** Implementados

### 3.3. Módulo `DeviceManager`

*   **Propósito:** Gestiona la configuración, el estado global del dispositivo (ID, modo) y ahora también centraliza la recolección de datos de todos los sensores.
*   **Estado:** Implementado

### 3.4. Módulo `WiFiManager`

*   **Propósito:** Gestiona la conexión a la red WiFi.
*   **Estado:** Implementado

### 3.5. Módulo `MqttManager`

*   **Propósito:** Gestiona la comunicación con el broker MQTT.
*   **Estado:** Implementado

---

## 4. Fase 3: Integración en `main.cpp`

El archivo principal orquesta la inicialización y el bucle de todos los módulos.

*   **Ubicación:** `src/main.cpp`
*   **Código Final:**
    ```cpp
    #include <Arduino.h>
    // ... includes ...
    #include "DeviceManager.h"
    #include "WiFiManager.h"
    #include "ScaleManager.h"
    #include "MqttManager.h"

    // --- Definiciones ---
    #define HX711_DOUT D1
    #define HX711_SCK D2

    // --- Instanciación de Módulos (el orden es importante) ---
    ScaleManager scaleManager(HX711_DOUT, HX711_SCK);
    DeviceManager deviceManager(scaleManager);
    WiFiManager wifiManager;
    MqttManager mqttManager(deviceManager, "192.168.0.6");
    // ...

    void setup() {
      // ... inicialización del serial, LittleFS ...
      
      deviceManager.setup();
      wifiManager.setup();
      // ... esperar a WiFi ...
      scaleManager.setup();
      mqttManager.setup(deviceManager.getDeviceId());
      // ...
    }

    void loop() {
      wifiManager.loop();
      mqttManager.loop();
      scaleManager.loop();

      if (wifiManager.isConnected() && mqttManager.isConnected()) {
        // ... lógica para publicar reporte de salud, eventos de consumo y datos periódicos ...
      }
    }
    ```
