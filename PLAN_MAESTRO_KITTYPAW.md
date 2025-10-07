# Plan Maestro del Proyecto KittyPaw

**Estado:** Activo | **Versión:** 1.0

## 1. Introducción

Este documento es el punto de partida y la guía central para todo el desarrollo, crecimiento y estrategia del proyecto KittyPaw. Su objetivo es unificar la visión y proporcionar enlaces directos a los documentos clave que definen el proyecto en detalle.

---

## 2. Visión del Producto y Estrategia de Negocio

El objetivo de KittyPaw es ofrecer tranquilidad a los dueños de mascotas a través del monitoreo inteligente de los hábitos de alimentación y bebida, sentando las bases para un futuro de cuidado proactivo de la salud.

*   **Modelo de Negocio:** Se basa en un flujo de ingresos dual: la venta del dispositivo de hardware y un modelo de suscripción mensual/anual (SaaS) para funcionalidades premium.
    *   **Documento de Referencia:** `docs/business/01_Modelo_de_Negocio/Canvas.md`

*   **Cliente Ideal:** Nuestro público objetivo es "Ana, la Dueña Proactiva", una persona urbana, tecnológica y profundamente preocupada por el bienestar de su mascota.
    *   **Documento de Referencia:** `docs/business/02_Marketing_y_Ventas/User_Persona.md`

*   **Marco Legal:** El proyecto operará bajo un marco legal claro que protege los datos del usuario y define las responsabilidades del servicio.
    *   **Documentos de Referencia:** `docs/business/05_Documentos_Legales/`

---

## 3. Roadmap de Desarrollo y Arquitectura

El desarrollo se ejecutará en fases, comenzando con una base sólida y expandiéndose hacia funcionalidades más complejas como la IA.

*   **Roadmap General:** El plan de desarrollo a alto nivel se divide en cuatro fases: Consolidación, Expansión Core, Madurez y Escalado.
    *   **Documento de Referencia:** `docs/ROADMAP.md`

*   **Arquitectura del Ecosistema:** El sistema está diseñado como un ecosistema de componentes interconectados que se comunican a través de APIs y protocolos estándar como MQTT.
    *   **Documento de Referencia:** `docs/tech/FLUJOS_DEL_ECOSISTEMA.md`

*   **Arquitectura del Firmware:** El componente de hardware se desarrollará utilizando una arquitectura moderna, modular y orientada a objetos bajo PlatformIO.
    *   **Documento de Referencia:** `apps/iot_firmware/DISEÑO_INTEGRAL_FIRMWARE.md`

---

## 4. Estrategia de Crecimiento y Financiamiento

El crecimiento se impulsará a través de una estrategia de financiamiento que combina capital público y privado, alineada con los hitos del roadmap de desarrollo.

*   **Oportunidades de Financiamiento:** Se han identificado oportunidades clave en programas de CORFO (Semilla Inicia) y en el ecosistema de Venture Capital y Aceleradoras de LatAm.
    *   **Documento de Referencia:** `docs/business/04_Postulaciones_y_Fondos/Estrategia_Financiamiento_2025-2026.md`

---

## 5. Plan de Acción Inmediato

1.  **Fase de Planificación (Finalizada):** Se ha completado la organización de la documentación y la definición de la estrategia teórica del proyecto.
2.  **Fase de Desarrollo - Firmware (Próximo Paso):** Iniciar la implementación práctica del nuevo firmware del dispositivo, siguiendo el plano definido en `apps/iot_firmware/DISEÑO_INTEGRAL_FIRMWARE.md`.
3.  **Fase de Desarrollo - Backend/Frontend:** Una vez que el firmware pueda enviar eventos, desarrollar las funcionalidades del backend para recibirlos y de la app cliente para visualizarlos.
4.  **Actividades Paralelas:**
    *   Preparar el "pitch deck" para inversionistas.
    *   Monitorear las fechas de las convocatorias de fondos públicos (CORFO).
