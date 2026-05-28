# FixFactory 🔧

> Plataforma web SaaS para la gestión de mantenimiento industrial en PyMEs.

FixFactory permite centralizar el registro, seguimiento y análisis de incidencias, órdenes de trabajo, mantenimiento preventivo, historial técnico de maquinaria y gestión de repuestos — reemplazando el uso de planillas Excel, correos y comunicación informal.

---

## Tabla de contenidos

- [Demo pública](#demo-pública)
- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Ejecutar localmente](#ejecutar-localmente)
- [Tests](#tests)
- [Autores](#autores)

---

## Demo pública

> [!IMPORTANT]
> El backend está hosteado en Render con instancia gratuita (puede tardar ~30 segundos en despertar). **Iniciá primero el backend antes de acceder al frontend.**

| | URL |
| --- | --- |
| 1️⃣ Backend | <https://fixfactory.onrender.com/> |
| 2️⃣ Frontend | <https://fixfactory.vercel.app/login> |

---

## Características

- 📋 **Gestión de incidencias y paradas** — Registro de fallas con máquina, descripción, prioridad e imagen adjunta
- 🔔 **Notificaciones automáticas** — Avisos por email al generar una incidencia
- 🛠️ **Órdenes de trabajo** — Flujo completo: pendiente → en proceso → en espera de repuesto → solucionado → cerrado
- 📅 **Mantenimiento preventivo** — Programación de tareas periódicas con alertas automáticas
- 📖 **Historial de fallas** — Ficha técnica por máquina con repuestos, costos y tiempos
- 🏭 **Inventario de máquinas** — Registro del parque de equipos con datos técnicos y documentación
- 🛒 **Gestión de repuestos y compras** — Integración entre mantenimiento y compras
- 📊 **Reportes y métricas** — Indicadores de fallas, costos, tiempos de parada y rendimiento por máquina
- 👥 **Roles de usuario** — Producción, Mantenimiento, Técnico, Compras y Gerencia

---

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Base de datos | MongoDB (NoSQL) |
| Infraestructura | SaaS en la nube, acceso multiplataforma vía HTTPS |

---

## Estructura del proyecto

```bash
fixfactory/
├── apps/
│   ├── api/       # Backend — TypeScript + Express
│   └── web/       # Frontend — React + Vite
```

---

## Ejecutar localmente

### Backend

```bash
cd apps/api
npm install
npm run dev
```

### Frontend

```bash
cd apps/web
npm install
npm run dev
```

---

## Tests

En `apps/api/test` se encuentran archivos con colecciones de peticiones HTTP de ejemplo para probar los endpoints de la API.

---

## Autores

Desarrollado por **[ExSixDevs](https://github.com/ExSixDevs)** en el marco de la **Tecnicatura Superior en Desarrollo de Software** — Práctica Profesionalizante IV (2026 - 1C - Comisión A).

- [:octocat: Clemens, Fernando](https://github.com/Ferclemens)
- [:octocat: Haberkon, Branko](https://github.com/brankohbk)
- [:octocat: Lerman, Camila](https://github.com/CamilaLerman)
- [:octocat: Lorenzo, Matías](https://github.com/mateteCode)
- [:octocat: Morondo, Martin](https://github.com/martinmorondo)
