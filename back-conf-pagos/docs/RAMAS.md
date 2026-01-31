# Ramas del repositorio

## Nombre de rama recomendado para este trabajo

```
feature/confirmacion-pagos-backend
```

**Alternativas igual de profesionales:**

- `feature/confirmacion-pagos-api` — si quieres enfatizar la API
- `feature/backend-confirmacion-pagos` — si el repo tiene varios proyectos
- `feat/confirmacion-pagos-hexagonal` — si quieres resaltar la arquitectura

## Flujo para no tocar `main`

1. Crear la rama y cambiarte a ella:
   ```bash
   git checkout -b feature/confirmacion-pagos-backend
   ```

2. Añadir y hacer el primer commit con todo el trabajo actual:
   ```bash
   git add .
   git commit -m "feat: backend confirmación de pagos (arquitectura hexagonal, IA, Excel)"
   ```

3. A partir de aquí, todo el desarrollo sigue en `feature/confirmacion-pagos-backend`. La rama `main` queda intacta (sin commits o con el estado inicial).

4. Cuando quieras integrar en `main`:
   ```bash
   git checkout main
   git merge feature/confirmacion-pagos-backend
   ```
