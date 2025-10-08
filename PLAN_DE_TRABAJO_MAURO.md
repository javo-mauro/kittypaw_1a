# Plan de Trabajo para Mauro: Desarrollo y Evaluación de Arquitecturas (v2)

**Objetivo:** Llegar a un punto de decisión sobre la arquitectura final de KittyPaw a través de un proceso de desarrollo estructurado, incluyendo una fase de maduración y pruebas del frontend.

---

### **Sesión 1 y 2: Fundación del Frontend (Completadas)**

*   **Estado:** ✅ Completado
*   **Resultado:** Se construyó una aplicación base con una UI funcional, componentes reutilizables, navegación y una capa de servicios con datos de prueba.

---

### **NUEVA Sesión 3: Implementación de Flujos de Creación (UI)**
*   **Objetivo:** Construir la interfaz de usuario para los modales y formularios de registro de usuario y creación de mascota.
*   **Rama de Git:** `main`
*   **Tareas Clave:**
    *   `[ ]` Añadir botón "Añadir Mascota" en `Mascotas.tsx`.
    *   `[ ]` Crear un nuevo componente `AddPetModal.tsx`.
    *   `[ ]` Diseñar el formulario dentro del modal con los campos definidos (Nombre, Especie, Raza, Fecha de Nacimiento).
    *   `[ ]` Mejorar la página `Register.tsx` con los campos definidos (Nombre, Email, Contraseña).

---

### **NUEVA Sesión 4: Lógica de Estado y Servicios (UI)**
*   **Objetivo:** Conectar los nuevos formularios a la capa de servicios `api.ts` y gestionar el estado de la UI.
*   **Rama de Git:** `main`
*   **Tareas Clave:**
    *   `[ ]` Añadir las funciones `registerUser` y `createPet` a `api.ts` (devolverán datos de prueba).
    *   `[ ]` Implementar la lógica de estado en los formularios para mostrar feedback al usuario (carga, errores, éxito).

---

### **NUEVA Sesión 5: Fundación de Pruebas**
*   **Objetivo:** Asegurar la calidad y estabilidad del frontend.
*   **Rama de Git:** `main`
*   **Tareas Clave:**
    *   `[ ]` Investigar e instalar **Vitest** y **React Testing Library** si no están presentes.
    *   `[ ]` Escribir pruebas unitarias para los componentes `DeviceCard` y `PetAvatar`.
    *   `[ ]` Escribir una prueba de integración para la página `Dashboard` que verifique que los datos del mock se renderizan.

---

### **Sesión 6: Implementación de la Arquitectura Local**
*   **Objetivo:** Poner en marcha una versión funcional mínima del sistema que corra 100% en tu máquina local.
*   **Rama de Git:** `feature/arquitectura-local` (creada a partir de `main`)
*   **Tareas Clave:**
    *   `[ ]` Crear las 3 ramas de experimentación.
    *   `[ ]` Configurar `docker-compose.yml` para levantar PostgreSQL y Mosquitto.
    *   `[ ]` Implementar en el backend los endpoints MÍNIMOS para que funcionen con el esquema antiguo.

---

### **Sesión 7: Implementación de la Arquitectura "Nube Actual"**
*   **Objetivo:** Evaluar la complejidad de la arquitectura de nube usando el esquema de datos original.
*   **Rama de Git:** `feature/arquitectura-nube-actual`
*   **Tareas Clave:**
    *   `[ ]` Configurar la conexión a servicios en la nube (Neon, AWS IoT).
    *   `[ ]` Implementar los mismos endpoints MÍNIMOS para que funcionen con el esquema antiguo.

---

### **Sesión 8: Implementación de la Arquitectura "Nube Optimizada"**
*   **Objetivo:** Demostrar la velocidad y simplicidad de la arquitectura propuesta.
*   **Rama de Git:** `feature/arquitectura-nube-optimizada`
*   **Tareas Clave:**
    *   `[ ]` Reemplazar `schema.ts` con el nuevo Diseño v2.0.
    *   `[ ]` Implementar los mismos endpoints MÍNIMOS aprovechando el nuevo esquema.