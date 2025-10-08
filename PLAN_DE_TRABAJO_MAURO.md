# Plan de Trabajo para Mauro: Desarrollo y Evaluación de Arquitecturas (v3)

**Objetivo:** Llegar a un punto de decisión sobre la arquitectura final de KittyPaw a través de un proceso de desarrollo estructurado, incluyendo una fase de maduración y pruebas del frontend.

---

### **Sesión 1 y 2: Fundación del Frontend (Completadas)**

*   **Estado:** ✅ Completado
*   **Resultado:** Se construyó una aplicación base con una UI funcional, componentes reutilizables, navegación y una capa de servicios con datos de prueba.

---

### **Sesión 3: Actualización del Esquema de Datos v2.1 (Completada)**
*   **Estado:** ✅ Completado
*   **Resultado:** El archivo `schema.ts` fue actualizado para reflejar la nueva arquitectura de "Hogares", sentando las bases para las nuevas funcionalidades.

---

### **NUEVA Sesión 4: Diseño del Motor del Wizard**
*   **Objetivo:** Crear el componente `InteractiveWizardForm.tsx` y la lógica para procesar un JSON de preguntas dinámico.
*   **Rama de Git:** `main`
*   **Tareas Clave:**
    *   `[ ]` Definir la estructura final del JSON de preguntas.
    *   `[ ]` Crear el componente base que renderiza un paso a la vez.
    *   `[ ]` Implementar la barra de progreso y los botones de navegación "Siguiente/Anterior".

---

### **NUEVA Sesión 5: Implementación de Inputs y Lógica de "Hogar"**
*   **Objetivo:** Implementar los tipos de preguntas básicas y la lógica de auto-completado del formulario.
*   **Rama de Git:** `main`
*   **Tareas Clave:**
    *   `[ ]` Crear los sub-componentes para cada tipo de pregunta (`text`, `select`, `boolean_buttons`).
    *   `[ ]` Implementar la lógica que detecta un "Hogar" existente y salta o pre-rellena las preguntas adecuadas.

---

### **NUEVA Sesión 6: Enriquecimiento Visual y Animaciones**
*   **Objetivo:** Pulir la experiencia de usuario del formulario para que sea un deleite visual.
*   **Rama de Git:** `main`
*   **Tareas Clave:**
    *   `[ ]` Integrar `Framer Motion` para las transiciones entre preguntas.
    *   `[ ]` Implementar los inputs ricos como las "tarjetas ilustradas".
    *   `[ ]` Añadir los microtextos de ánimo y el feedback visual al seleccionar opciones.

---

### **Sesión 7, 8 y 9: Experimentación de Arquitecturas**
*   **Objetivo:** Crear las 3 ramas (`local`, `nube-actual`, `nube-optimizada`) para implementar y comparar las diferentes arquitecturas de backend.
*   **Rama de Git:** `feature/arquitectura-*`
*   **Tareas Clave:** `[ ]` Iniciar la implementación del backend en cada una de las ramas según lo planeado.