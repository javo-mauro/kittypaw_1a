# Plan de Trabajo para Mauro: Desarrollo y Evaluación de Arquitecturas (v3)

**Objetivo:** Llegar a un punto de decisión sobre la arquitectura final de KittyPaw a través de un proceso de desarrollo estructurado, incluyendo una fase de maduración y pruebas del frontend.

---

### **Sesión 1 y 2: Fundación del Frontend (Completadas)**

*   **Estado:** ✅ Completado
*   **Resultado:** Se construyó una aplicación base con una UI funcional, componentes reutilizables, navegación y una capa de servicios con datos de prueba.

---

### **NUEVA Sesión 3: Actualización del Esquema de Datos (v2.1)**
*   **Objetivo:** Modificar el archivo `apps/app_principal/shared/schema.ts` para que refleje la nueva arquitectura de "Hogares".
*   **Rama de Git:** `main`
*   **Tarea Clave:** `[ ]` Reescribir el `schema.ts` con las nuevas tablas (`households`, `pets_to_devices`) y las modificaciones a `users`, `pets` y `devices`.

---

### **NUEVA Sesión 4: UI del Flujo de Onboarding (Mascotas y Dispositivos)**
*   **Objetivo:** Construir la interfaz de usuario para los pasos de creación del onboarding v2.0.
*   **Rama de Git:** `main`
*   **Tareas Clave:**
    *   `[ ]` Crear el modal y formulario para "Añadir Mascota", incluyendo el botón para la foto.
    *   `[ ]` Crear la vista (placeholder) de la cámara para escanear QR.
    *   `[ ]` Crear la vista para la selección de mascotas que usarán un dispositivo.

---

### **NUEVA Sesión 5: Lógica de Servicios y Pruebas**
*   **Objetivo:** Simular la lógica del nuevo flujo y asegurar la calidad.
*   **Rama de Git:** `main`
*   **Tareas Clave:**
    *   `[ ]` Actualizar `api.ts` con nuevas funciones simuladas (ej. `registerUserAndHousehold`, `createPet`).
    *   `[ ]` Conectar la UI del onboarding a estos nuevos servicios.
    *   `[ ]` Escribir una prueba unitaria para el nuevo formulario de "Añadir Mascota".

---

### **Sesión 6, 7 y 8: Experimentación de Arquitecturas**
*   **Objetivo:** Crear las 3 ramas (`local`, `nube-actual`, `nube-optimizada`) para implementar y comparar las diferentes arquitecturas de backend.
*   **Rama de Git:** `feature/arquitectura-*`
*   **Tareas Clave:** `[ ]` Iniciar la implementación del backend en cada una de las ramas según lo planeado.