# Front — Confirmación de pago

Frontend en **React + Vite + TypeScript** para el sistema de confirmación de pagos.

- **Inicio**: formulario para el estudiante (dos desplegables: Módulo y Estudiante desde la BD, carga de imagen del comprobante, botón **Enviar comprobante**). La validación la realiza el backend contra el Excel (extracto) y se guarda el comprobante en la tabla `ComprobantePago` con el estado de confirmación.
- **Administrador**: acceso con clave (`ADMIN_API_KEY` del backend). Panel con estadísticas (total, pendientes, realizados, no realizados), tabla de comprobantes y posibilidad de cambiar el estado de confirmación (PENDIENTE / REALIZADO / NO_REALIZADO) y ver la imagen del comprobante.

## Cómo ejecutar

1. **Backend en marcha** en `http://localhost:3000` (desde la carpeta `back-conf-pagos`).
2. En esta carpeta:
   ```bash
   npm install
   npm run dev
   ```
3. Abrir en el navegador la URL que indique Vite (p. ej. `http://localhost:5173`). Las peticiones a `/api` se redirigen al backend.

## Tecnologías

- React + TypeScript + Vite
- Estilos minimalistas (rojo, gris, blanco, negro)

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
