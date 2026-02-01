import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = request.headers['x-admin-key'] as string | undefined;
    const expected = this.config.get<string>('ADMIN_API_KEY');
    if (!expected || expected.trim() === '') {
      throw new UnauthorizedException(
        'Configuración de administrador no disponible (ADMIN_API_KEY).',
      );
    }
    if (key?.trim() !== expected.trim()) {
      throw new UnauthorizedException('Clave de administrador incorrecta.');
    }
    return true;
  }
}
