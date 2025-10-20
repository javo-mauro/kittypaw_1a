
# Documentación de Sensores

Este documento detalla el funcionamiento de cada manejador de sensor dentro del directorio `src`.

---

## 1. `ScaleManager` (Sensor de Peso)

- **Propósito:** Encapsula toda la lógica relacionada con la celda de carga (balanza).
- **Sensor Controlado:** HX711, a través de la librería `HX711_ADC` de Olav Kallhovd.
- **Funcionamiento Principal:**
    - **Arquitectura No Bloqueante:** Se seleccionó esta librería específicamente porque no bloquea el procesador. Su método `update()` se llama en cada ciclo del `loop()` principal, permitiendo que las tareas de red se ejecuten en paralelo sin conflictos, lo cual es crítico para la estabilidad del ESP8266.
    - **Tara (Calibración) No Bloqueante:** Al arrancar, el `setup()` inicia una tara no bloqueante (`start(2000, true)`). El `loop()` principal se encarga de procesar esta tara en segundo plano hasta que se completa, sin detener el resto del programa.
    - **Detección de Eventos:** Una vez calibrado, el `loop()` obtiene lecturas de peso actualizadas y alimenta una máquina de estados para detectar "eventos de consumo" (cambios de peso significativos y estables).
- **Integración:** Es utilizado por `DeviceManager` para obtener el peso actual para las publicaciones periódicas y por `main.cpp` para detectar y publicar los eventos de consumo.

---

## 2. `TemperatureHumidityManager` (Sensor Ambiental)

- **Propósito:** Gestiona la lectura de temperatura y humedad ambiental.
- **Sensor Controlado:** DHT11.
- **Funcionamiento Principal:**
    - Provee métodos simples (`getTemperature()`, `getHumidity()`) para obtener las lecturas actuales.
    - Realiza una validación básica para asegurar que las lecturas no sean valores inválidos (ej. `NaN`). Si la lectura falla, devuelve un valor centinela de `-999.0`.
- **Integración:** Es instanciado y utilizado por el `DeviceManager`, que centraliza la recolección de datos de todos los sensores. `DeviceManager` llama a estos métodos para construir el payload de datos que se envía periódicamente.

---

## 3. `LightManager` (Sensor de Luz)

- **Propósito:** Gestiona la lectura del nivel de luz ambiental.
- **Sensor Controlado:** Fotorresistencia (LDR) conectada a un pin analógico.
- **Funcionamiento Principal:**
    - Lee el valor crudo del pin analógico `A0`.
    - Mapea el valor leído (en un rango de 0 a 1023) a una escala de "lux" aproximada (0 a 500), replicando la lógica del firmware anterior para mantener la consistencia de los datos.
- **Integración:** Al igual que el `TemperatureHumidityManager`, es utilizado por el `DeviceManager` para recolectar su dato y añadirlo al payload periódico de sensores.
