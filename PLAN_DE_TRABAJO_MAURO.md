# Plan de Trabajo para Mauro: Desarrollo y Evaluación de Arquitecturas

**Objetivo:** Llegar a un punto de decisión sobre la arquitectura final de KittyPaw a través de un proceso de desarrollo estructurado en 5 sesiones.

---

### **Sesión 1: Creación de la Fundación del Frontend (Parte 1)**

*   **Objetivo Principal:** Establecer el esqueleto navegable de la aplicación y la capa de comunicación con datos falsos.
*   **Rama de Git:** `main`
*   **Tareas Clave:**
    *   \[ ] Crear el "Service Layer" en `apps/app_principal/client/src/services/api.ts` que defina las funciones (`getDevices`, `getPets`, etc.) y devuelva datos de prueba (mocks).
    *   \[ ] Desarrollar la estructura principal de la aplicación: layout, sistema de navegación (ej. menú inferior) y las páginas vacías (Dashboard, Dispositivos, Mascotas, Perfil).
*   **Resultado Esperado:** Una aplicación que se puede abrir y en la que se puede navegar entre las diferentes secciones, aunque estas estén vacías o muestren datos estáticos.

---

### **Sesión 2: Completitud Visual del Frontend**

*   **Objetivo Principal:** Darle vida a la aplicación poblando las vistas con componentes y los datos de prueba.
*   **Rama de Git:** `main`
*   **Tareas Clave:**
    *   \[ ] Desarrollar un conjunto básico de componentes de UI reutilizables (ej. `DeviceCard`, `PetAvatar`, `StatWidget`).
    *   \[ ] Integrar estos componentes en sus respectivas páginas (Dashboard, Mis Dispositivos, etc.).
    *   \[ ] Conectar las vistas al "Service Layer" para que muestren los datos de prueba.
*   **Resultado Esperado:** Una aplicación que "parece" completamente funcional, con listas de dispositivos y mascotas de prueba. Un prototipo de alta fidelidad listo para ser conectado a un backend real.

---

### **Sesión 3: Implementación de la Arquitectura Local**

*   **Objetivo Principal:** Poner en marcha una versión funcional mínima del sistema que corra 100% en tu máquina local.
*   **Rama de Git:** `feature/arquitectura-local` (creada a partir de `main`)
*   **Tareas Clave:**
    *   \[ ] Crear las 3 ramas de experimentación (`local`, `nube-actual`, `nube-optimizada`).
    *   \[ ] En la rama `local`, configurar `docker-compose.yml` para levantar servicios de PostgreSQL y Mosquitto (MQTT).
    *   \[ ] Implementar en el backend los endpoints MÍNIMOS (ej. `GET /devices`) para leer desde la base de datos local (usando el esquema antiguo).
    *   \[ ] Conectar el frontend para que consuma estos endpoints locales y muestre datos reales de la base de datos local.
*   **Resultado Esperado:** Ver en la aplicación la lista de dispositivos leída desde una base de datos corriendo en Docker en tu PC.

---

### **Sesión 4: Implementación de la Arquitectura "Nube Actual"**

*   **Objetivo Principal:** Evaluar el rendimiento y la complejidad de la arquitectura de nube usando el esquema de datos original.
*   **Rama de Git:** `feature/arquitectura-nube-actual`
*   **Tareas Clave:**
    *   \[ ] Configurar el backend para conectar con la base de datos en la nube (Neon) y AWS IoT Core.
    *   \[ ] Implementar los mismos endpoints de la sesión 3, pero esta vez trabajando contra los servicios en la nube y el **esquema de datos original y complejo**.
    *   \[ ] Conectar el frontend a este backend en la nube.
*   **Resultado Esperado:** Tener la aplicación funcionando con la nube, pero notando la dificultad de programar y consultar con el esquema de datos antiguo (ej. campos `jsonb`).

---

### **Sesión 5: Implementación de la Arquitectura "Nube Optimizada"**

*   **Objetivo Principal:** Demostrar la velocidad, simplicidad y escalabilidad de la arquitectura propuesta.
*   **Rama de Git:** `feature/arquitectura-nube-optimizada`
*   **Tareas Clave:**
    *   \[ ] **Reemplazar `schema.ts` con el nuevo Diseño v2.0.**
    *   \[ ] Generar la migración de la base de datos con Drizzle Kit.
    *   \[ ] Implementar los mismos endpoints, pero esta vez con un código mucho más simple y limpio gracias al nuevo esquema.
    *   \[ ] Conectar el frontend y observar la diferencia en rendimiento y claridad.
*   **Resultado Esperado:** Una aplicación funcional, rápida y con una base de código backend limpia y mantenible. La validación final de la propuesta de diseño.

---

Al final de estas 5 sesiones, tendrás tres implementaciones funcionales que te permitirán tomar una decisión informada y estratégica.