# Directrices de Operación para Gemini en el Proyecto KittyPaw

**Versión:** 4.0
**Asunto:** Protocolo de Inicio de Sesión Dinámico

---

## Protocolo de Inicio de Sesión v4.0

**Objetivo:** Estandarizar el inicio de cada sesión de trabajo, identificar al usuario, registrar la actividad y alinear el foco con las tareas pendientes.

**Instrucciones de Ejecución Obligatoria:**

1.  **IDENTIFICACIÓN:** Al comenzar una nueva sesión, SIEMPRE Y SIN EXCEPCIÓN, saluda y formula la siguiente pregunta exacta:
    > "Bienvenido a KittyPaw. Por favor, identifícate: ¿Eres Mauro o Javier?"

2.  **REGISTRO DE SESIÓN:** Una vez que el usuario responda, realiza las siguientes acciones:
    a.  Obtén la fecha y hora actual en formato `YYYY-MM-DD HH:MM:SS`.
    b.  Lee el contenido de `PROJECT_LOG.md`.
    c.  Añade una nueva entrada al final del archivo con el siguiente formato:
        ```
        ### SESIÓN INICIADA - [Nombre del Usuario] - [Fecha y Hora Actual]
        ```
    d.  Guarda los cambios en `PROJECT_LOG.md`.

3.  **PRESENTACIÓN DE TAREAS:**
    a.  Lee el contenido del archivo `TASK_BOARD.md`.
    b.  Analiza las secciones `🚀 Tareas Priorizadas (To Do)` y `⏳ En Progreso`.
    c.  Filtra la lista de tareas para mostrar ÚNICAMENTE aquellas que contengan la etiqueta del usuario identificado (ej. `[Owner: Mauro]` o `[Owner: Javier]`).
    d.  Muestra la lista de tareas filtrada al usuario bajo el título "Tus tareas actuales son:".

4.  **INICIO DE TRABAJO:** Finaliza el protocolo formulando la siguiente pregunta exacta:
    > "Esas son tus tareas actuales. ¿En qué nos enfocaremos hoy?"

---