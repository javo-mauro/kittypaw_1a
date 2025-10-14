# Especificación: Sistema de Auto-Diagnóstico en Arranque (POST)

**Versión:** 1.0
**Autor:** Gemini Code Assist

## 1. Objetivo

Implementar un sistema de auto-diagnóstico (Power-On Self-Test o POST) que se ejecute cada vez que un dispositivo ESP32 se enciende. Este sistema verificará la integridad de los componentes clave de hardware y software y enviará un reporte de estado al backend.

Esto nos permitirá monitorear la salud de la flota de dispositivos de forma proactiva.

---

## 2. Implementación en el Firmware

Se creará un nuevo módulo/clase, `SelfTestManager`, que será responsable de orquestar las pruebas.

### 2.1. Flujo de Ejecución

1.  En la función `setup()` de `main.cpp`, después de inicializar todos los demás módulos (`DeviceManager`, `WiFiManager`, etc.).
2.  Se instancia y se ejecuta el `SelfTestManager`.
3.  El `SelfTestManager` realiza una serie de pruebas secuenciales.
4.  Genera un único reporte en formato JSON con los resultados.
5.  El `MqttManager` publica este reporte en un tópico MQTT específico.

### 2.2. Pruebas a Realizar

El `SelfTestManager` debe ejecutar las siguientes comprobaciones y registrar su estado (`PASS` o `FAIL`) con un breve detalle.

*   **`filesystem`**:
    *   **Prueba:** Verificar que el sistema de archivos LittleFS se montó correctamente.
    *   **Detalle:** "LittleFS mounted" o "Failed to mount LittleFS".
*   **`wifi_hardware`**:
    *   **Prueba:** Comprobar que el hardware WiFi del chip se inicializa sin errores.
    *   **Detalle:** "WiFi module initialized".
*   **`sensor_hx711` (Balanza)**:
    *   **Prueba:** Verificar que el chip HX711 está conectado y responde. Usar la función `is_ready()`.
    *   **Detalle:** "HX711 ready" o "HX711 not found".
*   **`sensor_dht` (Temp/Humedad)**:
    *   **Prueba:** Intentar leer el sensor DHT. La prueba pasa si los valores no son `NaN`.
    *   **Detalle:** "DHT sensor responsive" o "Failed to read from DHT".
*   **`ntp_sync`**:
    *   **Prueba:** Comprobar si la sincronización de la hora por NTP fue exitosa.
    *   **Detalle:** "Time synchronized successfully" o "NTP sync failed".

### 2.3. Formato del Reporte JSON

El reporte debe seguir estrictamente esta estructura:

```json
{
  "reportType": "self_test",
  "deviceId": "KP-AABBCC",
  "timestamp": "2025-10-14T10:00:00Z",
  "firmwareVersion": "2.1.0",
  "results": {
    "filesystem": { "status": "PASS", "details": "LittleFS mounted" },
    "wifi_hardware": { "status": "PASS", "details": "WiFi module initialized" },
    "sensor_hx711": { "status": "PASS", "details": "HX711 ready" },
    "sensor_dht": { "status": "FAIL", "details": "Failed to read from DHT" },
    "ntp_sync": { "status": "PASS", "details": "Time synchronized successfully" }
  },
  "overallStatus": "FAIL"
}
```

### 2.4. Tópico MQTT

El reporte se publicará en el siguiente tópico: `kittypaw/reports/health`