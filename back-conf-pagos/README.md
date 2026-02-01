<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Backend de **confirmación de pagos** con NestJS en **arquitectura hexagonal**. Recibe un formulario (nombre del estudiante y generación seleccionados en el front, foto del comprobante), extrae del comprobante el **número de documento/comprobante** y el **monto** (por defecto con **AWS Textract**, gratuito en free tier) y los compara con la columna **Documento** del Excel. Soporta dos tipos de comprobante: recibo físico (Documento: número; monto en Total/Efectivo) y transferencia digital (Comprobante: número; monto en Monto). Ver `src/confirmacion-pago/README.md` para la estructura del módulo.

### Configuración

1. Copia `.env.example` a `.env` y define:
   - **DATABASE_URL**: URL de PostgreSQL (ej. `postgresql://usuario:password@localhost:5432/confirmaciones_pago`).
   - **ADMIN_API_KEY**: Clave para el área de administrador (obligatoria para las rutas `/admin/*`). El front pide esta clave para entrar al panel de administración.
   - **VISION_PROVIDER**: `textract` (por defecto, AWS gratuito), `mock` o `openai`.
   - **AWS_ACCESS_KEY_ID** y **AWS_SECRET_ACCESS_KEY** (y opcionalmente **AWS_REGION**) para AWS Textract.
   - **EXCEL_PAGOS_PATH** (opcional): ruta al Excel. Por defecto: `./data/pagos.xlsx`.

2. Coloca tu archivo Excel en `data/pagos.xlsx` (o la ruta indicada). El Excel debe tener una hoja con columnas como:
   - **Estudiante** (o Nombre, Alumno)
   - **Generacion** (o Generación, Gen)
   - **Documento** (o Comprobante, Número de transacción, Referencia, Folio) — se compara con el número extraído del comprobante
   - **Monto** (o Cantidad, Importe, Total)

### API

- **GET** `/confirmacion-pago/opciones`  
  Devuelve `{ estudiantes: string[], generaciones: string[] }` para poblar los selects del front.

- **POST** `/confirmacion-pago/validar`  
  Body: `multipart/form-data` con:
  - `estudiante`: string
  - `generacion`: string (`generacion 1` … `generacion 5`)
  - `comprobante`: archivo (imagen JPEG, PNG o WebP, máx. 10 MB)

  Respuesta: `{ valido, mensaje, datosExtraidos?, coincidenciaExcel?, error? }`.

## Project setup

```bash
$ npm install
```

## Prisma (base de datos)

El proyecto usa **Prisma 7** con PostgreSQL. Para levantar Prisma:

1. **Crea el archivo `.env`** (si no existe) y define `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://usuario:password@localhost:5432/confirmaciones_pago"
   ```

2. **Instala `dotenv`** (necesario para que la CLI de Prisma lea `.env`):
   ```bash
   npm install --save-dev dotenv
   ```

3. **Genera el cliente de Prisma**:
   ```bash
   npm run prisma:generate
   ```

4. **Crea la base de datos y aplica las migraciones** (con PostgreSQL corriendo):
   ```bash
   npm run prisma:migrate
   ```
   La primera vez te pedirá un nombre para la migración (ej. `init`).

   **Alternativa:** si prefieres sincronizar el schema sin historial de migraciones:
   ```bash
   npm run prisma:push
   ```

5. **(Opcional)** Abre Prisma Studio para ver/editar datos:
   ```bash
   npm run prisma:studio
   ```

El **PrismaService** está registrado como módulo global: puedes inyectarlo en cualquier servicio con `constructor(private prisma: PrismaService) {}` y usar `this.prisma.estudiante`, `this.prisma.modulo`, etc.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
