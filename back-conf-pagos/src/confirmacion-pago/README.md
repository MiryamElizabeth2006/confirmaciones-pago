# Módulo Confirmación de Pago (Arquitectura Hexagonal)

## Estructura

```
confirmacion-pago/
├── domain/                    # Núcleo: sin dependencias externas
│   ├── constants/             # Generacion, GENERACIONES
│   ├── ports/                 # Contratos (driven): qué necesita la app del exterior
│   │   ├── extraer-datos-comprobante.port.ts
│   │   └── leer-pagos-registrados.port.ts
│   └── value-objects/         # DatosComprobante, PagoRegistrado, ResultadoValidacion
├── application/              # Casos de uso
│   ├── tokens.ts             # Símbolos de inyección de puertos
│   └── use-cases/
│       ├── validar-pago.use-case.ts
│       └── obtener-opciones-select.use-case.ts
└── infrastructure/           # Adaptadores
    ├── adapters/
    │   ├── vision/           # Extracción de texto del comprobante (OCR/IA)
    │   │   ├── aws-textract.adapter.ts   # AWS Textract (gratuito, por defecto)
    │   │   ├── openai-vision.adapter.ts
    │   │   └── mock-vision.adapter.ts
    │   └── persistence/     # Excel
    │       └── excel-pagos.adapter.ts
    └── web/                  # Controlador HTTP (adaptador primario)
        └── confirmacion-pago.controller.ts
```

## Flujo de validación

1. **Front** envía: nombre del estudiante (seleccionado), generación (seleccionada), imagen del comprobante. **Estudiante y generación son solo para registro**; no intervienen en la comparación.
2. **Del comprobante** se extraen (con IA), según el tipo de imagen:
   - **Tipo 1 (recibo físico):** número junto a **"Documento"**, monto en "Efectivo" o "Total", **fecha** y **nombre cuenta destino** (para registro).
   - **Tipo 2 (transferencia digital):** número junto a **"Comprobante"**, monto en "Monto", **fecha** y **nombre cuenta destino** (para registro).
3. **Comparación (única):** se busca en el Excel una fila donde la columna **Documento** = número extraído (Documento o Comprobante) y la columna **Monto** = monto extraído. No se compara por estudiante ni generación.
4. La respuesta incluye `datosExtraidos` con numeroTransaccion, monto, fecha y nombreCuentaDestino (para registro).

## Puertos

- **ExtraerDatosComprobantePort**: extrae `{ numeroTransaccion, monto, fecha?, nombreCuentaDestino? }` de una imagen. Por defecto: `AwsTextractAdapter` (gratuito). Opcional: `OpenAIVisionAdapter` o `MockVisionAdapter`.
- **LeerPagosRegistradosPort**: devuelve el listado de pagos registrados. Implementado por `ExcelPagosAdapter`.
