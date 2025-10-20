# KittyPaw Monorepo

Este es el monorepo principal para el ecosistema de monitoreo de mascotas KittyPaw. Contiene todas las aplicaciones, servicios y documentación relacionados con el proyecto.

## 🚀 Estructura del Monorepo

El proyecto utiliza [Turborepo](https://turbo.build/) para gestionar el monorepo. Todas las aplicaciones y paquetes se encuentran en el directorio `apps/`.

-   **/apps/app_principal**: La aplicación principal full-stack. Incluye el backend de Node.js/Express, la API, y el frontend de React (Vite) que los usuarios finales utilizan.
-   **/apps/iot_firmware**: Contiene el código C++/Arduino para el dispositivo físico (ESP32) encargado de recolectar datos de los sensores (peso, temperatura, etc.).
-   **/apps/dashboard_datos**: Un dashboard de administración y Business Intelligence desarrollado en Python con Streamlit. Se utiliza para el análisis interno de los datos recolectados.
-   **/apps/app_camara**: Un proyecto de I+D para la experimentación con visión por computadora (TensorFlow.js) para el reconocimiento de mascotas.

-   **/docs**: Contiene toda la documentación funcional y técnica del proyecto, incluyendo el modelo de negocio y la arquitectura.

## 🐋 Arquitectura Docker

El proyecto está completamente contenedorizado usando Docker y Docker Compose para asegurar un entorno de desarrollo consistente y reproducible. La arquitectura consiste en tres servicios principales: una base de datos PostgreSQL, el backend de Node.js y el frontend de React.

Para una explicación detallada de la configuración, los servicios y el flujo de trabajo de colaboración, por favor consulta el documento de arquitectura completo:

**[➡️ Ver Arquitectura Docker Completa](./docs/tech/ARQUITECTURA_DOCKER.md)**

## 🏁 Cómo Empezar

Sigue estos pasos para configurar y ejecutar el entorno de desarrollo en tu máquina local.

### 1. Requisitos Previos

Asegúrate de tener instalado el siguiente software:

-   [Node.js](https://nodejs.org/) (versión 20.x o superior)
-   [npm](https://www.npmjs.com/) (generalmente se instala con Node.js)
-   [Python](https://www.python.org/) (versión 3.9 o superior, para `dashboard_datos`)

### 2. Instalación

Clona el repositorio y navega a la carpeta raíz. Luego, instala todas las dependencias de los proyectos del monorepo con un solo comando:

```bash
npm install
```

### 3. Ejecutar los Servidores de Desarrollo

Para lanzar la aplicación principal (`app_principal`), necesitarás **dos terminales**.

**Terminal 1: Iniciar el Backend**

Navega a la carpeta de la aplicación principal y ejecuta el servidor:

```bash
cd apps/app_principal
npm run dev:server
```

**Terminal 2: Iniciar el Frontend**

En la segunda terminal, navega a la misma carpeta y ejecuta el cliente de Vite:

```bash
cd apps/app_principal
npm run dev:client
```

Una vez ejecutado, este comando te mostrará la URL local (normalmente `http://localhost:5173`) donde puedes ver la interfaz de la aplicación.

Para ejecutar el dashboard de datos, navega a su directorio e inícialo con Streamlit:

```bash
cd apps/dashboard_datos
pip install -r requirements.txt
streamlit run dashboard.py
```
