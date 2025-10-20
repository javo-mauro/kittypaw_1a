
# Firmware de Estación de Monitoreo IoT - KittyPaw

Este proyecto implementa el firmware para un dispositivo IoT basado en el microcontrolador ESP8266. El dispositivo está diseñado para actuar como una estación de monitoreo ambiental y de peso, ideal para aplicaciones como comederos inteligentes para mascotas o monitoreo de condiciones ambientales.

## Características Principales

- **Conectividad WiFi:** Se conecta a una red WiFi para obtener acceso a internet.
- **Comunicación MQTT:** Envía datos de los sensores a un broker MQTT para su posterior procesamiento y visualización.
- **Sincronización de Tiempo:** Utiliza el protocolo NTP para obtener la hora exacta y estampar los eventos.
- **Arquitectura Modular:** El código está organizado en "Managers" (manejadores), donde cada uno se encarga de una funcionalidad específica (WiFi, MQTT, Sensores), facilitando su mantenimiento y escalabilidad.

## Sensores Integrados

El firmware está diseñado para leer datos de los siguientes sensores:

1.  **Celda de Carga (HX711_ADC):** Mide el peso en una balanza. Se utiliza la librería `HX711_ADC` por su arquitectura no bloqueante, esencial para la estabilidad en un entorno de red con ESP8266.
2.  **Sensor de Temperatura y Humedad (DHT11):** Mide las condiciones ambientales.
3.  **Sensor de Luz (Fotorresistencia/LDR):** Mide el nivel de luz ambiental.

## Flujo de Operación

1.  **Inicio y Calibración:** El dispositivo se inicia y se conecta a la red WiFi. Si es el primer arranque, realiza una calibración (tara) no bloqueante de la balanza.
2.  **Sincronización:** Sincroniza la hora a través de un servidor NTP.
3.  **Conexión MQTT:** Se conecta al broker MQTT y se suscribe a tópicos de comandos.
4.  **Monitoreo y Publicación:**
    - De forma periódica (cada 5 segundos), lee los datos de todos los sensores (temperatura, humedad, luz y peso) y los publica en el tópico `KPCL0022/pub`.
    - De forma paralela, monitorea el sensor de peso para detectar "eventos de consumo". Si ocurre uno, publica los detalles en el tópico `kittypaw/events`.
