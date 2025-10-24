# Tablero de Tareas del Proyecto KittyPaw

Este documento es el tablero de control de tareas activas. Reemplaza al Roadmap para la gestión del día a día. Las tareas se mueven de `Backlog` a `To Do`, luego a `In Progress` y finalmente a `Done`.

---

## 🎯 Backlog de Tareas

*   `[Backend]` Crear el endpoint `POST /api/devices/claim` para el onboarding. **[Owner: Ambos]**
*   `[Frontend]` Crear el boceto de la vista para "Añadir Dispositivo" que incluirá el lector QR. **[Owner: Mauro]**
*   `[IoT/Firmware]` Integrar funcionalidad de cámara en ESP32CAM y llevarla por protocolo html a una API donde pueda mover el viso por internet. **[Owner: Javier]** **[Status: Pendiente]**



---

## 🚀 Tareas Priorizadas (To Do)

*   `[Gestión]` Implementar y seguir el Roadmap para Postulación a Fondos de Capital Semilla. **[Owner: Ambos]**

*   `[Backend/AWS]` **Solucionar error de conexión con AWS IoT Core:** El backend no puede conectarse al broker MQTT. Revisar certificados, políticas y endpoint en la consola de AWS. Ver resumen en 'docs/dev_notes/DEBUGGING_AWS_IOT_CONNECTION_SUMMARY.md'. **[Owner: Mauro]** **[Priority: Blocker]**
*   `[Backend]` **Solucionar error de autenticación de la base de datos:** El servidor de backend no puede conectarse a la base de datos PostgreSQL debido a un error de autenticación persistente. Ver resumen en 'docs/dev_notes/DEBUGGING_DB_CONNECTION_SUMMARY.md'. **[Owner: Mauro]** **[Priority: Blocker]**
*   `[IoT/Backend]` Unificar la configuración del broker MQTT entre el firmware y el backend. **[Owner: Mauro]**
*   `[Frontend]` Conectar el Dashboard al WebSocket para mostrar datos en tiempo real. **[Owner: Mauro]**


*   `[1c] [Firmware]` Implementar la lógica de pruebas en `SelfTestManager` para el auto-diagnóstico. **[Owner: Javier]**
*   `[1d] [Frontend]` Investigar y solucionar el problema de caché del navegador/Vite que impide que el frontend cargue la configuración correcta de la URL de la API y WebSocket. **[Owner: Javier]** **[Priority: Blocker]**

---

## ⏳ En Progreso

*   `[UX/UI]` Diseñar e implementar la "Ficha Integral de la Mascota" (Formulario Mágico). **[Owner: Mauro]**

---

## ✅ Completado

*   `[Gestión]` Fase de Planificación y Documentación Estratégica. **[Owner: Ambos]**
*   `[Frontend]` Construir la base de la aplicación (UI, componentes y servicios mock).
*   `[DB]` Implementar arquitectura de datos v2.2 con "Hogares".
*   `[IoT/Backend]` Implementar sistema de Auto-Diagnóstico (POST) y corregir entorno Docker. **[Owner: Ambos]**
*   `[Backend]` Revisión integral y correcciones iniciales de la interacción DB-Routes-Storage. **[Owner: Mauro]`**
*   `[Backend]` Corregir el error de login eliminando la lógica obsoleta de `pet_owners`. **[Owner: Mauro]`**
*   `[Gestión]` Preparar la primera versión del Pitch Deck para postulación a fondos. **[Owner: Ambos]**
*   `[1a] [Firmware]` Configurar el proyecto en PlatformIO con las librerías necesarias. **[Owner: Javier]**
*   `[1b] [Firmware]` Implementar la clase `WiFiManager` para la conexión. **[Owner: Javier]**
*   `[Firmware]` Listado de Wifis conocidas. **[Owner: Javier]**
*   `[Firmware]` Reconexion de wifis conocidas. **[Owner: Javier]**