# Probar la API desde Insomnia

## 1. Arrancar el backend

```bash
npm run start:dev
```

El servidor queda en **http://localhost:3000** (o el `PORT` de tu `.env`).

## 2. Importar la colección

1. Abre Insomnia.
2. **Application** → **Preferences** → **Data** → **Import Data** (o arrastra el archivo).
3. Elige el archivo `Confirmacion-pago-API.json` de esta carpeta.

Verás la carpeta **Confirmación de Pago** con dos peticiones.

## 3. Peticiones

### GET Opciones (estudiantes y generaciones)

- **URL:** `GET http://localhost:3000/confirmacion-pago/opciones`
- Sin body. Devuelve `{ estudiantes: string[], generaciones: string[] }` para los selects del front.

### POST Validar pago (comprobante) — Multipart

- **URL:** `POST http://localhost:3000/confirmacion-pago/validar`
- **Body:** **Multipart Form**. Debes **añadir 3 campos** con estos nombres exactos:

| Nombre del campo | Tipo   | Valor / Acción |
|------------------|--------|----------------|
| `estudiante`     | Text   | Nombre del estudiante (debe existir en tu Excel). |
| `generacion`     | Text   | `generacion 1`, `generacion 2`, … `generacion 5`. |
| `comprobante`    | **File** | Clic en **Choose File** / **Seleccionar archivo** y elige la imagen del comprobante (JPG, PNG o WebP). |

**Guía paso a paso en Insomnia:**

1. **Pestaña Body** → asegúrate de que el tipo sea **Multipart** (no JSON).

2. **Campo 1 – estudiante**
   - En la primera fila, en la columna **Name** (o "Nombre"), escribe exactamente: `estudiante`
   - En la columna **Value** (o "Valor"), escribe un nombre, por ejemplo: `Juan Pérez` (debe coincidir con un nombre de tu Excel si ya lo tienes)
   - El tipo debe ser **Text**. Si hay un desplegable, déjalo en **Text**

3. **Campo 2 – generacion**
   - En la segunda fila, en **Name** escribe: `generacion`
   - En **Value** escribe una de estas opciones exactas: `generacion 1`, `generacion 2`, `generacion 3`, `generacion 4` o `generacion 5`
   - Tipo: **Text**

4. **Campo 3 – comprobante (aquí está el error si no envía la imagen)**
   - En la tercera fila, en **Name** escribe: `comprobante`
   - **No dejes este campo como Text.** En la misma fila hay un desplegable o selector de tipo (donde dice "Text"). **Haz clic ahí y cambia a "File"** (Archivo).
   - Al cambiar a **File**, aparecerá un botón tipo **"Choose File"**, **"Seleccionar archivo"** o **"Browse"**. Haz clic y elige en tu PC la imagen del comprobante (archivo .jpg, .png o .webp).
   - Después de elegir el archivo, debe verse la ruta o el nombre del archivo en esa fila.

5. Pulsa **Send**.

**Importante:** Si `comprobante` sigue como **Text** (aunque escribas algo), el servidor no recibe la imagen y responderá "Debe enviar la imagen del comprobante." Tiene que ser tipo **File** y tienes que haber seleccionado un archivo de imagen.

### POST Validar pago (JSON + base64) — Para probar con JSON

- **URL:** `POST http://localhost:3000/confirmacion-pago/validar-json`
- **Body:** **JSON** con:
  - **estudiante** (string)
  - **generacion** (string)
  - **comprobanteBase64** (string): la imagen en base64. Puedes enviar:
    - Solo el base64: `"iVBORw0KGgo..."`
    - O con prefijo: `"data:image/jpeg;base64,/9j/4AAQ..."`

Para obtener el base64 de una imagen desde la consola del navegador (en una página con un `<input type="file">`) o con Node: `require('fs').readFileSync('ruta/imagen.jpg').toString('base64')`. Luego pega ese string en `comprobanteBase64`.

## 4. Si el puerto no es 3000

Edita la URL en cada petición o crea un **Environment** en Insomnia con una variable `base_url` (ej: `http://localhost:3000`) y usa `{{ base_url }}/confirmacion-pago/opciones` y `{{ base_url }}/confirmacion-pago/validar`.
