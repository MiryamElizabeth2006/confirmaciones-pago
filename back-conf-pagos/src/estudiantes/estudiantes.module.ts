import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EstudiantesController } from './estudiantes.controller';
import { EstudiantesService } from './estudiantes.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [EstudiantesController],
  providers: [EstudiantesService, PrismaService],
  exports: [EstudiantesService],
})
export class EstudiantesModule {}
