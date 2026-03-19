# GP-Pasajes AppStatus: Sistema de Gestión y Monitoreo de Aplicaciones

## 1. Introducción

### Descripción General
GP-Pasajes AppStatus es una plataforma centralizada de monitoreo diseñada para supervisar el ciclo de vida de aplicaciones móviles en las tiendas oficiales de Google Play y Apple App Store. Proporciona una visión en tiempo real de las versiones, builds y estados de aprobación de múltiples aplicaciones distribuidas en diferentes entidades bancarias.

### Problema que Resuelve
La gestión manual de decenas de aplicaciones móviles a través de distintas consolas de desarrollador es ineficiente y propensa a errores. La falta de una vista unificada dificulta la detección temprana de rechazos, retrasos en revisiones o desajustes entre versiones de diferentes plataformas (Android vs iOS).

### Objetivo del Sistema
Centralizar la información crítica de todas las aplicaciones corporativas en un único tablero de control, automatizando la extracción de datos mediante APIs oficiales y facilitando la toma de decisiones para los equipos de QA, Desarrollo y Producto.

### Beneficios Principales
*   **Visibilidad 360°:** Control total sobre múltiples bancos y plataformas en una sola pantalla.
*   **Detección Inmediata:** Identificación instantánea de aplicaciones que requieren acción o han sido rechazadas.
*   **Identidad Institucional:** Visualización de logos oficiales diferenciando entre segmentos de Individuos y Empresas.
*   **Consistencia de Versiones:** Asegura que los lanzamientos de BEE (Empresas) y HBI (Individual) mantengan la paridad necesaria.
*   **Eficiencia Operativa:** Reduce el tiempo de consulta manual en consolas de Apple y Google en un 90%.

---

## 2. Descripción General del Sistema

### Qué es el sistema
Es un Dashboard Inteligente de monitoreo de "Store Status" que actúa como una capa de observabilidad sobre las consolas de Google Play Console y App Store Connect.

### Cómo funciona a alto nivel
El sistema se conecta de forma segura a través de Service Accounts y Claves API a las tiendas. Un motor de sincronización extrae periódicamente los metadatos de cada aplicación (Versión, Build, Estado de Revisión) y los almacena en una base de datos centralizada, presentándolo todo con una identidad visual premium y coherente.

### Organizaciones Objetivo
Ideal para empresas con grandes portafolios de aplicaciones móviles, especialmente en el sector fintech o bancario, donde la sincronización multi-entidad es crítica.

### Diferenciador Competitivo
A diferencia de herramientas genéricas, GP-Pasajes AppStatus está diseñado para la gestión de "Multi-Entidad", permitiendo agrupar aplicaciones por bancos (Santa Fe, Entre Ríos, San Juan, Santa Cruz) y segmentos (BEE vs HBI) con su branding oficial.

---

## 3. Arquitectura Técnica

El sistema ha sido construido bajo los estándares más modernos de desarrollo web, priorizando la velocidad, la escalabilidad y la seguridad.

### Stack Tecnológico
*   **Frontend:** Desarrollado en **Next.js 14** con **React** y **Tailwind CSS**. Implementa un sistema de diseño premium con activos vectoriales oficiales (SVGs) para plataformas y logos institucionales de alta resolución.
*   **Backend:** Utiliza el motor de **Serverless Functions de Vercel**, permitiendo una ejecución rápida de las tareas de sincronización sin necesidad de mantener servidores costosos 24/7.
*   **Base de Datos:** **PostgreSQL** alojado en **Neon.tech**, una base de datos Serverless de alto rendimiento que permite escalabilidad instantánea.
*   **Manejo de Activos:** Directorio centralizado de logos diferenciados por segmento para asegurar que cada app refleje su marca correcta.

### Integración y Despliegue (CI/CD)
*   **Control de Versiones:** Repositorio centralizado en **GitHub**.
*   **Despliegue Continuo:** Integración directa con **Vercel**, asegurando que cada cambio validado se despliegue automáticamente en producción en segundos.

### Seguridad y Manejo de Datos
*   Uso de **Entornos Virtuales Seguros (.env)** para el manejo de credenciales.
*   Integración con **OAuth 2.0 y JWT** para comunicaciones seguras con las APIs de Google y Apple.
*   Cifrado de datos en reposo y en tránsito.

---

## 4. Funcionalidades del Sistema

### Sincronización en Tiempo Real (Sync APIs)
*   **Qué hace:** Realiza una llamada en cascada a las APIs oficiales de Google y Apple.
*   **Para qué sirve:** Extrae el estado exacto de cada app (Publicada, En Revisión, Rechazada, etc.).
*   **Extrae:** Estados exactos incluyendo el nuevo "Pendiente de Publicación" (Ready to Publish).
*   **Problema que resuelve:** Elimina la necesidad de entrar manualmente a 16+ consolas diferentes para ver un cambio de estado.

### Tablero de Estadísticas e Interactividad
*   **Qué hace:** Clasifica las apps por estado con tarjetas clicables para filtrado rápido.
*   **Filtro Inteligente:** Al cambiar entre estados (ej. de Published a In Review), el sistema resetea automáticamente el filtro por banco para asegurar una vista global completa.

### Resumen Ejecutivo Toggleable (BEE / HBI)
*   **Qué hace:** Una sección especial que compara los dos segmentos clave (Empresas vs Individuos).
*   **Control de Usuario:** Puede ocultarse o mostrarse con un solo clic ("Ver Resumen") para mantener el enfoque en la tabla principal cuando sea necesario.

### Filtrado por Entidad Bancaria
*   **Qué hace:** Permite aislar los datos específicos de un banco (ej. Banco Santa Fe).
*   **Para qué sirve:** Análisis específico por unidad de negocio.

### Identidad Bancaria Segmentada
*   **HBI (Individuos):** Muestra el logo institucional limpio de cada banco.
*   **BEE (Empresas):** Muestra versiones exclusivas del logo con la etiqueta "EMPRESAS", permitiendo una auditoría visual instantánea.

---

## 5. Demostraciones y Pruebas

Para validar la potencia del sistema, se pueden realizar las siguientes demostraciones:

1.  **Sincronización de un Lanzamiento:** Subir una build y presionar "Sync APIs" para ver el cambio de estado en vivo.
2.  **Auditoría de Marcas:** Abrir el resumen ejecutivo y verificar que las apps de la tabla izquierda (BEE) porten el logo con etiqueta de Empresas, mientras que la derecha (HBI) porta el estándar.
3.  **Flujo de Filtrado Sincronizado:** Filtrar por "Banco Santa Fe", luego clicar en la tarjeta "In Review" y observar cómo el sistema limpia el filtro del banco para mostrar todas las apps en revisión de todo el portafolio.
4.  **Identificación de Plataforma:** Visualizar los nuevos logos de Android (Robot) e iOS (Apple) que sustituyen a íconos genéricos, facilitando la distinción técnica.

---

## 6. Escalabilidad del Sistema

El sistema es **Serverless de extremo a extremo**. Esto significa que es capaz de manejar desde un puñado de aplicaciones hasta cientos, manteniendo el mismo rendimiento gracias a la infraestructura de Vercel y Neon.tech.

---

## 7. Ventajas Competitivas

| Tradicional / Manual | GP-Pasajes AppStatus |
| :--- | :--- |
| Tiempo de chequeo: 40+ minutos | Tiempo de chequeo: 5 segundos |
| Reportes desactualizados (Excel) | Datos 100% reales de la API |
| Branding genérico o inexistente | Identidad oficial por banco y segmento |
| Filtros estáticos y aislados | Interacción fluida y reseteo inteligente |

---

## 8. Futuras Mejoras (Roadmap)

*   **Notificaciones Push/Telegram:** Alertas cuando una app cambie a "Rechazada".
*   **Histórico de Aprobación:** Gráficos que muestren el tiempo promedio de revisión por plataforma.
*   **Gestión Centralizada:** Edición de metadatos básicos directamente desde el dashboard.

---
**Documento desarrollado por:** Algeiba - Sistema de Gestión de Apps
**Versión:** 1.1.0
**Fecha:** Marzo 2026
