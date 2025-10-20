# Indicaciones Gemini IOT: Guía del Firmware KittyPaw

**Versión:** 2.0
**Autor:** Gemini Code Assist

## 1. Introducción

Este documento resume el trabajo de refactorización y mejora realizado sobre el firmware original del proyecto KittyPaw. El objetivo principal fue migrar de un script monolítico (`.ino`) a una arquitectura de software modular, robusta y profesional utilizando PlatformIO y C++ moderno.

El resultado es un firmware que no solo envía datos, sino que los procesa localmente para detectar eventos inteligentes, es configurable de forma remota y es resiliente a fallos de red.

---

## 2. Arquitectura del Firmware

El firmware está diseñado en base a módulos, donde cada clase tiene una única responsabilidad. El archivo `src/main.cpp` actúa como un orquestador que coordina estos módulos.

*   **`DeviceManager`**: Gestiona la identidad y configuración del dispositivo.
    *   Genera un ID único (ej. `KP-AABBCC`) a partir de la MAC del chip.
    *   Administra el modo de operación ("comedero" o "bebedero"), guardando la configuración en el archivo `config.json`.

*   **`WiFiManager`**: Gestiona la conexión a la red WiFi.
    *   Opera de forma **no bloqueante**, permitiendo que el resto del programa siga funcionando aunque no haya conexión.
    *   Intenta reconectarse automáticamente a intervalos regulares si se pierde la señal.

*   **`ScaleManager`**: Encapsula toda la lógica del sensor de peso (HX711).
    *   Implementa una **máquina de estados** para detectar de forma inteligente un "evento de consumo".
    *   Calcula la duración y la cantidad consumida, en lugar de solo enviar el peso bruto.
    *   Guarda la calibración de la tara en `scale_offset.txt` para que persista entre reinicios.

*   **`MqttManager`**: Administra toda la comunicación segura con AWS IoT.
    *   Maneja la conexión y reconexión de forma no bloqueante.
    *   Publica los eventos de consumo detectados por el `ScaleManager` en formato JSON.
    *   Se suscribe a un topic de comandos para permitir el control remoto del dispositivo.

*   **`SelfTestManager`**: Ejecuta un chequeo de salud (POST) en cada arranque.
    *   Verifica el estado de los componentes clave (memoria, sensores, etc.).
    *   Envía un reporte de diagnóstico al backend a través de un tópico MQTT específico (`kittypaw/reports/health`).
    *   Permite el monitoreo proactivo de la salud de toda la flota de dispositivos.

---

## 3. Flujo de Operación

1.  **Arranque (`setup`)**:
    *   Se inicializan todos los módulos en orden: `DeviceManager`, `LittleFS`, `WiFiManager`, `ScaleManager` y `MqttManager`.
    *   Se carga la configuración desde los archivos `.json` y `.txt` en la memoria del dispositivo.
    *   Se inicia el primer intento de conexión a la red WiFi.
    *   Se sincroniza la hora a través de NTP (necesario para los certificados de AWS).

2.  **Ciclo Principal (`loop`)**:
    *   El `WiFiManager` y el `MqttManager` se aseguran de mantener las conexiones activas sin detener el programa.
    *   Si hay conexión, el `ScaleManager` monitorea el peso constantemente.
    *   Cuando el `ScaleManager` detecta que un evento de consumo ha finalizado, devuelve un objeto `ConsumptionEvent`.
    *   El `main.cpp` recibe este evento y le ordena al `MqttManager` que lo publique en AWS IoT.

---

## 4. Gestión de la Configuración (LittleFS)

El firmware utiliza el sistema de archivos interno para una configuración flexible y persistente. Para desplegar, se debe crear una carpeta `data` en la raíz del proyecto.

*   `data/wifi.json`: Almacena las credenciales de la red WiFi. Si no existe, se usan las credenciales por defecto del código.
    ```json
    {
      "ssid": "NombreDeTuRed_2.4GHz",
      "password": "TuContraseña"
    }
    ```
*   `config.json` (creado automáticamente): Guarda el modo de operación (`device_mode`).
*   `scale_offset.txt` (creado automáticamente): Guarda la calibración de la tara de la balanza.

> **Nota:** Para subir los archivos de la carpeta `data`, se debe usar la tarea **"Upload Filesystem Image"** de PlatformIO.

---

## 5. Comunicación Remota (MQTT)

La interacción con el dispositivo se realiza a través del broker MQTT de AWS IoT.

*   **Topic de Publicación de Eventos**: `kittypaw/events`
    *   Aquí el dispositivo envía los datos de los eventos de consumo.

*   **Topic de Recepción de Comandos**: `kittypaw/commands/<DEVICE_ID>`
    *   El dispositivo se suscribe a este tema único para recibir instrucciones. `<DEVICE_ID>` es el ID generado por el `DeviceManager`.

### Comandos Disponibles

1.  **Realizar Tara de la Balanza**:
    ```json
    {
      "tare": true
    }
    ```

2.  **Cambiar Modo de Operación**:
    ```json
    {
      "device_mode": "bebedero"
    }
    ```

3.  **Reiniciar el Dispositivo**:
    ```json
    {
      "reboot": true
    }
    ```

---

## 6. Control de Versiones (Git)

El proyecto ha sido inicializado como un repositorio Git. Se ha configurado un archivo `.gitignore` para excluir archivos de compilación y de configuración del editor.

El flujo de trabajo consiste en:
1.  Realizar cambios en el código.
2.  Añadir los archivos modificados con `git add <archivo>`.
3.  Guardar los cambios con un mensaje descriptivo usando `git commit -m "mensaje"`.
4.  Subir los cambios al repositorio remoto con `git push`.

Este proceso asegura un historial claro y un respaldo del código fuente.