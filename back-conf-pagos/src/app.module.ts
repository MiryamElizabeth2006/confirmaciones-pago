import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ConfirmacionPagoModule } from './confirmacion-pago/confirmacion-pago.module';
import { EstudiantesModule } from './estudiantes/estudiantes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    ConfirmacionPagoModule,
    EstudiantesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
