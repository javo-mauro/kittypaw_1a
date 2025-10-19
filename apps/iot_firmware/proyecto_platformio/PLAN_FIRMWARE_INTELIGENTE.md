# Plan de Implementación: Firmware Inteligente

Este documento detalla los cambios necesarios en el firmware `KPCL0022_Gem_1a.ino` para convertirlo en un "dispositivo inteligente", capaz de procesar eventos localmente y operar en diferentes modos.

---

## 1. Requisitos Funcionales

1.  **Modo de Operación Configurable:**
    *   El dispositivo debe poder ser configurado como "Comedero" o "Bebedero".
    *   Esta configuración se recibirá a través de un mensaje MQTT y se guardará en la memoria no volátil (LittleFS) para que persista entre reinicios.

2.  **Detección de Eventos Local (Lógica Opción B):**
    *   El dispositivo ya no enviará datos de sensores en un intervalo fijo.
    *   En su lugar, monitoreará continuamente el sensor de peso para detectar eventos de "consumo" (la mascota comiendo o bebiendo).
    *   Cuando se detecte y finalice un evento, el dispositivo enviará un único mensaje MQTT con los datos procesados del evento.

3.  **Nuevo Formato de Mensaje MQTT:**
    *   El payload de los datos publicados cambiará para reflejar la naturaleza del evento.

---

## 2. Cambios Técnicos Propuestos en `KPCL0022_Gem_1a.ino`

### 2.1. Nuevas Variables Globales y Constantes

Se necesitarán nuevas variables para manejar el estado de la detección y la configuración del modo.

```cpp
// Modo de operación del dispositivo
enum DeviceMode { COMEDERO, BEBEDERO };
DeviceMode currentMode = COMEDERO; // Valor por defecto

// Estados para la máquina de estados de detección
enum DetectionState { IDLE, DETECTING_CHANGE, PET_PRESENT, COOLDOWN };
DetectionState currentState = IDLE;

// Umbrales y temporizadores para la detección
const float WEIGHT_CHANGE_THRESHOLD = 5.0; // Mínimo cambio de peso en gramos para iniciar detección
const unsigned long EVENT_TIMEOUT = 30000; // 30 segundos sin cambios para finalizar un evento

// Variables para medir el evento
unsigned long eventStartTime = 0;
float initialWeight = 0.0;
```

### 2.2. Modificación de la Función `callback()` de MQTT

La función que procesa los mensajes MQTT entrantes (`KPCL0022/sub`) debe ser actualizada para reconocer un nuevo comando de configuración.

*   **Mensaje JSON esperado:** `{"device_mode": "comedero"}` o `{"device_mode": "bebedero"}`.
*   **Acción:** Al recibir este mensaje, el firmware actualizará la variable `currentMode` y guardará la configuración en un nuevo archivo en LittleFS (ej: `config.txt`).

### 2.3. Refactorización Profunda del `loop()` Principal

El `loop()` actual, que probablemente tiene un `delay()` y envía datos periódicamente, será reemplazado por una máquina de estados no bloqueante.

*   **Estado `IDLE`:**
    *   Lee el peso continuamente.
    *   Si `abs(currentWeight - lastWeight) > WEIGHT_CHANGE_THRESHOLD`, se asume que una mascota se ha acercado.
    *   Se transita al estado `PET_PRESENT`, se guarda `initialWeight` y `eventStartTime`.

*   **Estado `PET_PRESENT`:**
    *   Continúa midiendo el peso.
    *   Si el peso se mantiene relativamente estable (con pequeñas fluctuaciones a la baja) pero no vuelve al valor inicial, se actualiza un temporizador.
    *   Si el peso vuelve al `initialWeight` o si el temporizador de `EVENT_TIMEOUT` expira, el evento se considera finalizado.
    *   Se calcula `eventDuration` y `amountConsumed = initialWeight - finalWeight`.
    *   Se construye y publica el JSON del evento.
    *   Se transita al estado `COOLDOWN`.

*   **Estado `COOLDOWN`:**
    *   Un breve período de espera para evitar la detección de eventos duplicados inmediatamente después de que uno ha terminado. Luego, se vuelve a `IDLE`.

### 2.4. Nuevo Formato de Payload de Publicación

El JSON enviado al tema `KPCL0022/pub` cambiará. En lugar de todos los datos de los sensores, se enviará un evento.

**Ejemplo de Payload:**
```json
{
  "deviceId": "ESP8266_XXXX",
  "timestamp": "2025-10-07T18:30:00Z",
  "eventType": "consumo",
  "payload": {
    "mode": "comedero", // o "bebedero"
    "duration_seconds": 45,
    "amount_consumed_grams": 20.5
  }
}
```

---

## 3. Impacto en el Backend

El servicio que escucha los mensajes MQTT (`apps/app_principal/server/mqtt.ts`) deberá ser modificado para interpretar este nuevo formato de JSON y almacenar los datos del evento en la base de datos en consecuencia.
