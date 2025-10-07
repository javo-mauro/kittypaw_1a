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

*   **Propósito:** Encapsula toda la lógica del sensor de peso (HX711) y la detección de eventos de consumo.
*   **Ubicación:** `lib/ScaleManager/`
*   **Interfaz (`ScaleManager.h`):**
    ```cpp
    #pragma once
    #include <Arduino.h>

    struct ConsumptionEvent {
      bool valid = false;
      float amount_consumed_grams = 0.0;
      unsigned long duration_seconds = 0;
    };

    class ScaleManager {
    public:
      ScaleManager(byte doutPin, byte sckPin);
      void begin();
      void tare();
      ConsumptionEvent update();
    private:
      // ... (variables privadas como en el diseño anterior)
    };
    ```

### 3.2. Módulo `DeviceManager`

*   **Propósito:** Gestiona la configuración y el estado global del dispositivo (ID, modo de operación).
*   **Ubicación:** `lib/DeviceManager/`
*   **Interfaz (`DeviceManager.h`):
    ```cpp
    #pragma once
    #include <Arduino.h>

    enum class DeviceMode { COMEDERO, BEBEDERO, UNKNOWN };

    class DeviceManager {
    public:
      void begin();
      String getDeviceID() const;
      DeviceMode getMode() const;
      void setMode(DeviceMode newMode);
    private:
      String _deviceID;
      DeviceMode _currentMode = DeviceMode::UNKNOWN;
      void loadConfiguration();
      void saveConfiguration();
    };
    ```
*   **Lógica de Implementación:** `begin()` cargará la configuración desde un `config.json` en LittleFS. `setMode()` la guardará. `getDeviceID()` construirá un ID único a partir de la MAC del ESP8266.

### 3.3. Módulo `WiFiManager`

*   **Propósito:** Gestiona la conexión a la red WiFi de forma no bloqueante.
*   **Ubicación:** `lib/WiFiManager/`
*   **Interfaz (`WiFiManager.h`):
    ```cpp
    #pragma once
    #include <Arduino.h>

    class WiFiManager {
    public:
      void begin(const char* ssid, const char* password);
      void handleConnection();
    private:
      const char* _ssid;
      const char* _password;
      unsigned long _reconnectInterval = 5000; // 5 segundos
      unsigned long _lastReconnectAttempt = 0;
    };
    ```
*   **Lógica de Implementación:** `handleConnection()` comprobará el estado de la conexión en cada ciclo. Si está desconectado, intentará reconectar solo si ha pasado el tiempo de `_reconnectInterval`, evitando así bloquear el `loop()`.

### 3.4. Módulo `MqttManager`

*   **Propósito:** Gestiona la comunicación con el broker MQTT (conexión, publicación, suscripción).
*   **Ubicación:** `lib/MqttManager/`
*   **Interfaz (`MqttManager.h`):
    ```cpp
    #pragma once
    #include <Arduino.h>
    #include "DeviceManager.h"
    #include "ScaleManager.h"

    class MqttManager {
    public:
      MqttManager(Client& netClient, DeviceManager& deviceManager);
      void begin(const char* server, int port);
      void handleConnection();
      void loop(); // Para procesar mensajes entrantes
      void publishEvent(const ConsumptionEvent& event);
    private:
      // ... (cliente, puntero a deviceManager, etc.)
      void callback(char* topic, byte* payload, unsigned int length); // Procesar mensajes
    };
    ```
*   **Lógica de Implementación:** Similar al `WiFiManager` para la reconexión. El `callback` procesará comandos como `setMode` y llamará a `_deviceManager.setMode()`. `publishEvent` usará `ArduinoJson` para crear el payload.

---

## 4. Fase 3: Integración en `main.cpp`

El archivo principal será limpio y servirá como orquestador de los módulos.

*   **Ubicación:** `src/main.cpp`
*   **Código de Ejemplo:**
    ```cpp
    #include <Arduino.h>
    #include "WiFiManager.h"
    #include "DeviceManager.h"
    #include "MqttManager.h"
    #include "ScaleManager.h"

    // --- Configuración de Pines y Credenciales ---
    #define WIFI_SSID "..."
    #define WIFI_PASS "..."
    #define MQTT_SERVER "..."

    #define HX711_DOUT_PIN 4
    #define HX711_SCK_PIN 5

    // --- Instanciación de Módulos ---
    DeviceManager deviceManager;
    WiFiManager wifiManager;
    ScaleManager scaleManager(HX711_DOUT_PIN, HX711_SCK_PIN);
    
    WiFiClient netClient;
    MqttManager mqttManager(netClient, deviceManager);

    void setup() {
      Serial.begin(115200);
      
      deviceManager.begin();
      wifiManager.begin(WIFI_SSID, WIFI_PASS);
      scaleManager.begin();
      mqttManager.begin(MQTT_SERVER, 1883);
    }

    void loop() {
      wifiManager.handleConnection();
      mqttManager.handleConnection();
      mqttManager.loop();

      ConsumptionEvent event = scaleManager.update();
      if (event.valid) {
        mqttManager.publishEvent(event);
      }
    }
    ```
