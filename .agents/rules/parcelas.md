---
trigger: always_on
---

# Proyecto

Sistema de administración de parcelas.

## Frontend

- React 19
- Vite
- TypeScript
- TailwindCSS
- React Router
- Axios

## Backend

- Django
- Django REST Framework
- PostgreSQL

## Arquitectura

Frontend y backend desacoplados.

React consume exclusivamente una API REST.

Nunca acceder directamente a la base de datos desde el frontend.

## Organización

src/
    components/
    pages/
    services/
    hooks/
    contexts/
    types/
    utils/

## Diseño

Seguir el diseño de referencia del dashboard.

Todo componente debe ser responsive.

Aplicar Mobile First.

Utilizar breakpoints de Tailwind.

Las tablas deben permitir scroll horizontal en dispositivos pequeños.

Las tarjetas deben reorganizarse automáticamente según el tamaño de pantalla.

## Componentes

Cada componente debe tener una única responsabilidad.

Evitar componentes demasiado grandes.

Crear componentes reutilizables.

## Flujo de trabajo

Antes de implementar una funcionalidad:

2. Explicar los archivos nuevos.
3. Esperar confirmación.
4. Implementar el código.