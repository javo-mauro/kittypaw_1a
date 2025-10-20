# Plan de Implementación: Firmware Inteligente

Este documento detalla los cambios necesarios en el firmware `KPCL0022_Gem_1a.ino` para convertirlo en un "dispositivo inteligente", capaz de procesar eventos localmente y operar en diferentes modos.

---

## 1. Requisitos Funcionales

1.  **Modo de Operación Configurable:**
    *   El dispositivo debe poder ser configurado como "Comedero" o "Bebedero".
    *   Esta configuración se recibirá a través de un mensaje MQTT y se guardará en la memoria no volátil (LittleFS) para que persista entre reinicios.

## 2. Lógica de Publicación Híbrida

*   El dispositivo ha evolucionado de un modelo de solo-eventos a un **modelo híbrido** más completo.
*   **Publicación Periódica:** Cada 5 segundos, el dispositivo publica una telemetría completa con los datos de todos los sensores (temperatura, humedad, luz y peso actual). Esto proporciona un monitoreo constante del estado del dispositivo y su entorno.
*   **Publicación de Eventos:** En paralelo, el `ScaleManager` monitorea continuamente el sensor de peso. Si detecta un evento de "consumo" (la mascota comiendo o bebiendo), publica un mensaje separado y específico para ese evento con detalles como la duración y la cantidad consumida.

### 2.3. Nuevo Formato de Mensaje MQTT

Existen dos tipos de mensajes principales:

**1. Telemetría Periódica (ej. `KPCL0022/pub`):**
```json
{
  "device_id": "KP-4CEBD61FBA19",
  "timestamp": 11400,
  "payload": {
    "temperature": 25.20,
    "humidity": 30.70,
    "light": 0,
    "weight": 105.5
  }
}
```

**2. Evento de Consumo (ej. `kittypaw/events`):**
```json
{
  "deviceId": "KP-4CEBD61FBA19",
  "eventType": "consumo",
  "payload": {
    "mode": "comedero",
    "duration_seconds": 45,
    "amount_consumed_grams": 20.5
  }
}
```

---

## 3. Impacto en el Backend

El servicio que escucha los mensajes MQTT (`apps/app_principal/server/mqtt.ts`) deberá ser modificado para interpretar este nuevo formato de JSON y almacenar los datos del evento en la base de datos en consecuencia.
