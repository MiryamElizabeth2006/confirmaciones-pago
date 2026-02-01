import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar .env manualmente para asegurar que esté disponible antes de Prisma
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private config: ConfigService) {
    // Obtener DATABASE_URL desde ConfigService primero, luego desde process.env
    const databaseUrl = config.get<string>('DATABASE_URL') || process.env.DATABASE_URL;
    
    if (!databaseUrl || databaseUrl.trim() === '') {
      console.error('DATABASE_URL value:', databaseUrl);
      console.error('process.env.DATABASE_URL:', process.env.DATABASE_URL);
      throw new Error(
        'DATABASE_URL is not defined or is empty in environment variables. ' +
        'Please check your .env file in the backend root directory. ' +
        'Expected format: DATABASE_URL="postgresql://user:password@host:port/database"'
      );
    }
    
    // Asegurar que DATABASE_URL esté disponible en process.env antes de construir PrismaClient
    // PrismaClient lee automáticamente DATABASE_URL de process.env
    process.env.DATABASE_URL = databaseUrl;

    // Llamar a super() - PrismaClient leerá DATABASE_URL de process.env automáticamente
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
