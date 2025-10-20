# Guía de Operación del Dispositivo IoT

Este documento explica cómo poner en marcha y visualizar los datos del dispositivo en dos escenarios: conectado al PC para depuración y de forma autónoma.

---

## Requisitos Previos

- **Broker Mosquitto:** El broker MQTT debe estar corriendo en tu PC. Para iniciarlo:
    1. Abre una terminal.
    2. Navega a su carpeta: `cd D:\mosquitto`
    3. Ejecuta: `.\mosquitto.exe -c mosquitto.conf -v`
    4. **Deja esta terminal abierta.**

- **Red WiFi:** Tanto el PC como el dispositivo ESP8266 deben estar conectados a la misma red WiFi (`VTR-2736410_2g`).

- **Dirección IP:** El PC que corre Mosquitto debe tener la dirección IP `192.168.0.6`. Si cambia, debes actualizarla en el archivo `src/main.cpp` y volver a compilar y subir el firmware.

---

## Escenario 1: Modo Conectado (para Depuración)

Usa este modo para ver los logs internos del dispositivo, diagnosticar problemas o ver la salida de `Serial.println()`.

1.  **Conecta** el dispositivo ESP8266 a tu PC con el cable USB.
2.  **Abre** el proyecto `proyecto_platformio` en Visual Studio Code.
3.  **Haz clic** en el icono del **enchufe** (🔌) en la barra de herramientas de PlatformIO en la parte inferior. Esto abrirá el **Monitor Serial**.

En la terminal del monitor, verás todos los mensajes internos del dispositivo en tiempo real.

---

## Escenario 2: Modo Autónomo (Funcionamiento Normal)

Usa este modo cuando el dispositivo no está conectado al PC y funciona con su propia fuente de alimentación (batería).

1.  **Inicia el Broker Mosquitto:** Asegúrate de que el broker esté funcionando en tu PC como se indica en los Requisitos Previos.

2.  **Inicia el Receptor de Datos:** Este script escuchará los mensajes que el dispositivo envía al broker.
    a. Abre una **nueva terminal** (deja la de Mosquitto abierta).
    b. Navega a la carpeta de este proyecto:
       ```sh
       cd D:\Escritorio\Proyectos\KittyPaw\Kittypaw_1a\apps\iot_firmware\proyecto_platformio
       ```
    c. Ejecuta el script:
       ```sh
       python receptor_local.py
       ```

3.  **Enciende el Dispositivo:** Alimenta tu dispositivo ESP8266 con su batería o fuente de poder externa.

Ahora, en la terminal donde ejecutaste `receptor_local.py`, empezarás a ver los mensajes JSON con los datos de los sensores que el dispositivo está publicando en tiempo real.
