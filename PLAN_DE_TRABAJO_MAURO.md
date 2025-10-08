# Plan de Trabajo para Mauro: Desarrollo y Evaluación de Arquitecturas (v4)

**Objetivo:** Implementar la "Ficha Integral de la Mascota" a través de un formulario interactivo y, posteriormente, evaluar las arquitecturas de backend.

---

### **Sesión 1-3: Fundaciones (Completadas)**

*   **Estado:** ✅ Completado
*   **Resultado:** Se construyó la base del frontend, se definió y se implementó la arquitectura de datos v2.2 en `DISEÑO_BASE_DE_DATOS.md` y `schema.ts`.

---

### **NUEVA Sesión 4: El Motor del "Formulario Mágico"**
*   **Objetivo:** Construir el componente reutilizable `InteractiveWizardForm.tsx`.
*   **Rama de Git:** `main`
*   **Tareas Clave:**
    *   `[ ]` Crear el archivo `lib/forms.ts` para definir la estructura de preguntas en JSON.
    *   `[ ]` Crear el componente `InteractiveWizardForm.tsx` que procesa el JSON.
    *   `[ ]` Implementar la barra de progreso y la navegación "Siguiente/Anterior".

---

### **NUEVA Sesión 5: Implementación de la Sección "Identificación"**
*   **Objetivo:** Construir la primera sección del formulario.
*   **Rama de Git:** `main`
*   **Tareas Clave:**
    *   `[ ]` Añadir las preguntas de "Identificación general" al JSON en `lib/forms.ts`.
    *   `[ ]` Crear los componentes de input necesarios (texto, fecha, subida de foto simulada).
    *   `[ ]` Integrar la sección en el motor del Wizard.

---

### **NUEVA Sesión 6: Implementación de la Sección "Salud" y "Hogar"**
*   **Objetivo:** Construir las secciones de antecedentes veterinarios y del hogar.
*   **Rama de Git:** `main`
*   **Tareas Clave:**
    *   `[ ]` Añadir las preguntas de "Estado de salud" e "Información del hogar" al JSON.
    *   `[ ]` Implementar los componentes de input necesarios (botones ilustrados, selectores múltiples).
    *   `[ ]` Implementar la lógica para omitir preguntas del hogar si ya existen los datos.

---

### **Siguientes Sesiones:**
*   Implementación del resto de las secciones del formulario (Convivencia, Alimentación, etc.).
*   Fase de Pruebas exhaustivas del nuevo formulario.
*   Fase de Experimentación de Arquitecturas (creación de las 3 ramas).
