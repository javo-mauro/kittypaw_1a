# Diseño del Módulo: ScaleManager

**Ubicación:** `lib/ScaleManager/`

## 1. Propósito

Esta clase encapsula toda la interacción con el sensor de peso (HX711) y contiene la lógica de la máquina de estados para detectar eventos de consumo de forma no bloqueante.

---

## 2. Interfaz Pública (Archivo `ScaleManager.h`)

```cpp
#pragma once

#include <Arduino.h>

// Estructura para devolver el resultado de un evento de consumo
struct ConsumptionEvent {
  bool valid = false;
  float amount_consumed_grams = 0.0;
  unsigned long duration_seconds = 0;
};

class ScaleManager {
public:
  // Constructor: recibe los pines del HX711
  ScaleManager(byte doutPin, byte sckPin);

  // Inicializa el sensor y carga la calibración
  void begin();

  // Realiza la tara de la balanza y guarda el nuevo offset
  void tare();

  // Método principal que debe ser llamado en cada ciclo del loop()
  // Devuelve un evento válido solo cuando uno ha finalizado.
  ConsumptionEvent update();

private:
  // Pines del sensor
  byte _doutPin;
  byte _sckPin;

  // Objeto del sensor
  class HX711* _scale;

  // Máquina de estados para la detección
  enum class DetectionState { IDLE, PET_PRESENT, COOLDOWN };
  DetectionState _currentState = DetectionState::IDLE;

  // Variables para la lógica de detección
  float _initialWeight = 0.0;
  unsigned long _eventStartTime = 0;
  unsigned long _lastChangeTime = 0;

  // Factor de calibración (se carga desde un archivo o se define)
  float _calibrationFactor = 420.0; // Valor de ejemplo

  // Offset de la tara (se guarda/carga desde LittleFS)
  float _tareOffset = 0.0;

  // Métodos privados para la lógica interna
  void FSM_IDLE();
  void FSM_PET_PRESENT();
  void FSM_COOLDOWN();
};
```

---

## 3. Lógica de Implementación (Archivo `ScaleManager.cpp`)

*   **`begin()`:** Inicializará el objeto `HX711`, leerá el `_tareOffset` desde LittleFS y lo aplicará.
*   **`tare()`:** Llamará a la función de tara del `HX711`, obtendrá el nuevo offset y lo guardará en LittleFS para persistencia.
*   **`update()`:** Contendrá un `switch` sobre la variable `_currentState` que llamará a la función de la máquina de estados correspondiente (`FSM_IDLE`, `FSM_PET_PRESENT`, etc.). Devolverá un `ConsumptionEvent` con `valid = true` solo al final de una detección.
*   **`FSM_IDLE()`:**
    *   Lee el peso actual.
    *   Si el peso es significativamente menor al peso de referencia (ej. -10g), indica que la mascota está presente.
    *   Cambia el estado a `PET_PRESENT`, registra `_initialWeight` y `_eventStartTime`.
*   **`FSM_PET_PRESENT()`:**
    *   Lee el peso continuamente.
    *   Si el peso fluctúa, actualiza `_lastChangeTime`.
    *   Si el peso se estabiliza ( `millis() - _lastChangeTime > EVENT_TIMEOUT` ), el evento ha terminado.
    *   Calcula los resultados, crea el `ConsumptionEvent`, y cambia el estado a `COOLDOWN`.
*   **`FSM_COOLDOWN()`:**
    *   Espera un tiempo corto (ej. 5 segundos) para evitar detecciones duplicadas y luego regresa a `IDLE`.
