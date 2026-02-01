import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ConfirmacionPagoModule } from './confirmacion-pago/confirmacion-pago.module';
import { AdminModule } from './admin/admin.module';
import { ComprobantesModule } from './comprobantes/comprobantes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    ConfirmacionPagoModule,
    AdminModule,
    ComprobantesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
