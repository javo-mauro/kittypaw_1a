# Manual de Setup del Entorno de Desarrollo (de Mauro para Javo)

¡Bienvenido al proyecto KittyPaw, Javo! Este manual te guiará para que puedas levantar todo el entorno de desarrollo en tu PC de forma rápida y sencilla usando Docker.

---

## Parte 1: ¿Qué es Docker y por qué lo usamos?

Imagina que en lugar de instalar una base de datos PostgreSQL y un entorno de Node.js directamente en tu Windows (lo cual puede ser complicado y generar conflictos), usamos unas "cajas virtuales" llamadas **contenedores**.

*   **Docker** es la herramienta que nos permite crear y gestionar estas cajas.
*   Cada caja (contenedor) tiene adentro todo lo que un servicio necesita para funcionar: la base de datos, el backend, etc.

**Beneficios para nosotros:**

1.  **Consistencia:** Tú, yo, y cualquier futuro desarrollador correremos la **misma versión exacta** de la base de datos y del backend. Se acabaron los problemas de "en mi máquina sí funciona".
2.  **Simplicidad:** En lugar de seguir 10 pasos para instalar todo, solo necesitarás ejecutar **un comando** para levantar todos los servicios.
3.  **Aislamiento:** Mantiene tu PC limpio. Todo lo relacionado con KittyPaw vive dentro de estas "cajas", no se mezcla con el resto de tus programas.

---

## Parte 2: Instalación de Docker Desktop

1.  **Ve a la página oficial:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2.  **Descarga el instalador** para Windows.
3.  **Ejecuta el instalador:** Es un proceso de instalación estándar (siguiente, siguiente, aceptar...).

**¡NOTA IMPORTANTE PARA WINDOWS!**

*   Docker en Windows usa algo llamado **WSL 2 (Windows Subsystem for Linux)** para funcionar. Es una tecnología de Microsoft que permite correr un entorno de Linux dentro de Windows.
*   Lo más probable es que el instalador de Docker se ofrezca a instalar o actualizar WSL 2 por ti. **Acepta y déjalo que lo haga.**
*   Es muy posible que después de la instalación, **necesites reiniciar tu PC**. Hazlo para que todos los cambios surtan efecto.
*   Una vez instalado y reiniciado, abre la aplicación "Docker Desktop" desde tu menú de inicio. Si ves una ballena en tu barra de tareas y la aplicación muestra un estado "Running" en verde, ¡estás listo!

---

## Parte 3: El Archivo `docker-compose.yml`

En la raíz de nuestro proyecto, hay un archivo llamado `docker-compose.yml`. Este es nuestro "plano de construcción" o la "receta" que le dice a Docker qué cajas (contenedores) debe crear.

Dentro, verás definidos los "servicios":

*   `db`: Nuestro contenedor para la base de datos **PostgreSQL**.
*   `backend`: Nuestro contenedor para el servidor de **Node.js**.

Este archivo se encarga de configurar las redes internas para que el `backend` pueda "hablar" con la `db` de forma automática.

---

## Parte 4: ¡A Correr los Servidores!

Esta es la mejor parte. Una vez que Docker Desktop esté corriendo, solo necesitas hacer una cosa:

1.  Abre una terminal (PowerShell, CMD, o la terminal de VSCode) en la raíz del proyecto KittyPaw.
2.  Ejecuta el siguiente comando:

    ```bash
    docker-compose up -d
    ```

*   **¿Qué hace este comando?** Lee el archivo `docker-compose.yml`, descarga las "imágenes" oficiales de PostgreSQL y Node (la primera vez puede tardar un poco), y crea e inicia nuestros contenedores `db` y `backend`.
*   El `-d` significa "detached", que hace que se ejecuten en segundo plano y te devuelvan el control de la terminal.

### Comandos Útiles de Docker

*   **Para detener todo:**
    ```bash
    docker-compose down
    ```
*   **Para ver los logs (registros) del backend en tiempo real (¡súper útil para depurar!):**
    ```bash
    docker-compose logs -f backend
    ```

---

## Parte 5: Estructura de Carpetas del Proyecto

Este proyecto es un "monorepo" gestionado con Turborepo. Esto significa que todo nuestro código (frontend, backend, firmware) vive en un solo gran repositorio, dentro de la carpeta `apps/`.

Aquí tienes un mapa de las carpetas más importantes:

*   `apps/`: **El corazón del proyecto. Contiene todas las aplicaciones.**
    *   `app_principal/`: La aplicación principal que usan los clientes.
        *   `client/`: El **Frontend** (React, TypeScript). **Área de Mauro.**
        *   `server/`: El **Backend** (Node.js, API, Drizzle). **Área de Ambos.**
        *   `shared/`: Esquemas y tipos compartidos entre el frontend y el backend.
    *   `iot_firmware/`: El **Firmware** para el dispositivo físico (ESP32). **Área de Javier.**
        *   `lib/`: Aquí diseñamos y escribimos las clases (módulos) del firmware.
        *   `src/`: Contiene el archivo `main.cpp` que orquesta todo.
    *   `dashboard_datos/`: El dashboard interno para análisis de negocio y datos. **Área de Mauro.**

*   `docs/`: **Toda la documentación del proyecto.**
    *   `business/`: Documentos de negocio, legales, de financiamiento, etc.
    *   `tech/`: Documentación técnica, como este manual, los diseños de arquitectura, etc.

*   **Archivos importantes en la raíz (`/`):**
    *   `PLAN_MAESTRO_KITTYPAW.md`: **El documento más importante.** Es el índice y la guía estratégica de todo el proyecto.
    *   `TASK_BOARD.md`: Nuestro tablero de tareas del día a día.
    *   `GEMINI.md`: Las instrucciones que yo, Gemini, sigo para ayudarte.
    *   `PROJECT_LOG.md`: El diario donde registramos todos los avances.
    *   `docker-compose.yml`: La "receta" para levantar los servicios del backend.
    *   `turbo.json` y `package.json`: Archivos de configuración del monorepo.

---

## Parte 6: Ejecutar la Aplicación Frontend (UI)

Mientras que `docker-compose` se encarga de levantar el backend (la base de datos y el servidor), para trabajar en la interfaz de usuario (la parte visual de la aplicación que corre en el navegador), necesitas seguir estos pasos.

Estos comandos se deben ejecutar en una **nueva terminal**, separada de la que usas para Docker.

1.  **Instalar Dependencias del Proyecto:**
    La primera vez que clonas el proyecto, o cada vez que haya nuevas librerías, necesitas instalar todas las dependencias. Este comando lee los archivos `package.json` de todo el proyecto y descarga todo lo necesario.
    ```bash
    npm install
    ```

2.  **Iniciar el Servidor de Desarrollo:**
    Este comando utiliza Turborepo para iniciar el servidor de desarrollo del frontend (y cualquier otro servicio definido). Verás un output en tu terminal que te indicará en qué dirección puedes ver la aplicación.
    ```bash
    npm run dev
    ```

3.  **Abrir la Aplicación:**
    Una vez que el comando anterior termine de compilar, tu terminal mostrará un mensaje similar a:

    > `> app_principal-client:dev:`
    > `> vite`
    >
    > `  VITE vX.X.X  ready in XXXms`
    >
    > `  ➜  Local:   http://localhost:5173/`

    Abre tu navegador web y ve a la dirección que aparece en **Local** (generalmente `http://localhost:5173/`) para ver y interactuar con la aplicación KittyPaw.

---

## Parte 7: Nuestro Flujo de Trabajo con Git y GitHub

Para mantener el código ordenado y colaborar de forma efectiva, seguiremos un flujo de trabajo simple basado en "ramas por funcionalidad" (feature branches).

**La Regla de Oro:** La rama `main` es sagrada. **Nunca trabajamos directamente sobre `main`**. Siempre debe estar estable.

### Tu Flujo de Trabajo Diario

Para cada tarea que tomes del `TASK_BOARD.md`, el proceso es el siguiente:

1.  **Sincroniza tu `main`:** Antes de empezar cualquier cosa, asegúrate de que tu rama `main` local esté actualizada con la del repositorio remoto (GitHub).
    ```bash
    git checkout main
    git pull origin main
    ```

2.  **Crea una Nueva Rama:** Crea una rama nueva para tu tarea. Usa un nombre descriptivo.
    ```bash
    # Ejemplo para una tarea de firmware
    git checkout -b javier/setup-platformio
    ```

3.  **Trabaja y Haz Commits:** Haz tu trabajo en esta nueva rama. Recuerda hacer commits pequeños y frecuentes (¡nuestro recordatorio de 40 minutos te ayudará!). Usa mensajes de commit claros.
    ```bash
    git add .
    git commit -m "feat(firmware): Implementa la clase WiFiManager"
    ```

4.  **Sube tu Rama:** Cuando hayas terminado la tarea (o al final del día), sube tu rama a GitHub.
    ```bash
    git push origin javier/setup-platformio
    ```

5.  **Crea un Pull Request (PR):** En la página de GitHub del proyecto, verás una opción para crear un "Pull Request" desde tu rama hacia `main`. Al crearlo, asigna al otro miembro del equipo (en este caso, a Mauro) como "Reviewer".

6.  **Revisión de Código:** El otro revisará tu código, podrá dejar comentarios o solicitar cambios. Este es el paso más importante de colaboración para asegurar la calidad.

7.  **Merge:** Una vez que el PR es aprobado, se fusiona (merge) con la rama `main`. ¡Y listo! Tu código ya es parte oficial del proyecto.

Este proceso protege nuestra rama principal y nos permite a ambos revisar el trabajo del otro antes de integrarlo.

---

¡Y eso es todo! Ahora sí tienes el mapa completo. Con `docker-compose up -d` corriendo y este mapa de carpetas, estás listo para empezar a trabajar. Si tienes cualquier duda, ¡solo pregunta!

---

**CON MUUUCHO AMOR DE MAURO PARA JAVO**

- Mauro
