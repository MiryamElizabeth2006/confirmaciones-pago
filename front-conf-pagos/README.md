# Frontend - Confirmación de Pagos

Frontend para el sistema de confirmación de pagos, construido con React, TypeScript y Vite.

## Características

- ✅ Integración completa con el backend
- ✅ Validación de formularios en el frontend
- ✅ Manejo centralizado de errores
- ✅ Componentes reutilizables
- ✅ Tipado fuerte con TypeScript
- ✅ UI moderna con Tailwind CSS

## Requisitos

- Node.js 18+ 
- npm o yarn

## Instalación

```bash
npm install
```

## Configuración

1. Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Configura la URL del backend en `.env`:
```
VITE_API_BASE_URL=http://localhost:3000
```

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`.

## Estructura del Proyecto

```
src/
 ├── api/           # Cliente HTTP centralizado
 ├── services/     # Lógica de negocio
 ├── hooks/        # Hooks personalizados (useOpciones, useValidarPago)
 ├── components/   # Componentes UI reutilizables
 ├── pages/        # Páginas de la aplicación
 ├── types/        # Tipos TypeScript
 └── utils/        # Utilidades (validaciones, constantes, errores)
```

## Endpoints Consumidos

- `GET /confirmacion-pago/opciones` - Obtiene estudiantes y generaciones
- `POST /confirmacion-pago/validar` - Valida un pago con imagen

## Notas

- El backend debe estar corriendo en el puerto configurado (por defecto 3000)
- CORS está habilitado en el backend
- No hay autenticación implementada
