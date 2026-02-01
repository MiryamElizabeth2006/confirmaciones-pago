import { Controller, Get } from '@nestjs/common';
import { EstudiantesService } from './estudiantes.service';

@Controller('estudiantes')
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  /**
   * GET /estudiantes
   * Obtiene todos los estudiantes con sus módulos
   */
  @Get()
  async obtenerTodos() {
    return this.estudiantesService.obtenerTodos();
  }

  /**
   * GET /estudiantes/nombres
   * Obtiene solo los nombres de los estudiantes para el select
   */
  @Get('nombres')
  async obtenerNombres() {
    const nombres = await this.estudiantesService.obtenerNombres();
    return { estudiantes: nombres };
  }

  /**
   * GET /estudiantes/con-comprobantes
   * Obtiene estudiantes que tienen comprobantes subidos (para tabla ADMIN)
   */
  @Get('con-comprobantes')
  async obtenerConComprobantes() {
    try {
      const estudiantes = await this.estudiantesService.obtenerConComprobantes();
      console.log(`[EstudiantesController] Devolviendo ${estudiantes.length} estudiantes con comprobantes`);
      return estudiantes;
    } catch (error) {
      console.error('[EstudiantesController] Error al obtener estudiantes con comprobantes:', error);
      throw error;
    }
  }

  /**
   * GET /estudiantes/test-db
   * Endpoint de prueba para verificar la conexión a la base de datos
   */
  @Get('test-db')
  async testDatabase() {
    const startTime = Date.now();
    console.log('[Test DB] Iniciando prueba de conexión a la base de datos...');
    
    try {
      // Test 1: Conexión básica
      console.log('[Test DB] Test 1: Verificando conexión básica...');
      await this.estudiantesService.testConnection();
      const connectionTime = Date.now() - startTime;
      console.log(`[Test DB] ✓ Conexión básica exitosa (${connectionTime}ms)`);

      // Test 2: Contar estudiantes
      console.log('[Test DB] Test 2: Contando estudiantes...');
      const countEstudiantes = await this.estudiantesService.countEstudiantes();
      console.log(`[Test DB] ✓ Total de estudiantes: ${countEstudiantes}`);

      // Test 3: Contar comprobantes
      console.log('[Test DB] Test 3: Contando comprobantes...');
      const countComprobantes = await this.estudiantesService.countComprobantes();
      console.log(`[Test DB] ✓ Total de comprobantes: ${countComprobantes}`);

      // Test 4: Contar módulos
      console.log('[Test DB] Test 4: Contando módulos...');
      const countModulos = await this.estudiantesService.countModulos();
      console.log(`[Test DB] ✓ Total de módulos: ${countModulos}`);

      // Test 5: Obtener un estudiante de ejemplo
      console.log('[Test DB] Test 5: Obteniendo estudiante de ejemplo...');
      const estudianteEjemplo = await this.estudiantesService.getEstudianteEjemplo();
      console.log(`[Test DB] ✓ Estudiante de ejemplo: ${estudianteEjemplo ? estudianteEjemplo.nombre : 'No hay estudiantes'}`);

      const totalTime = Date.now() - startTime;
      console.log(`[Test DB] ✓ Todos los tests completados exitosamente (${totalTime}ms total)`);

      return {
        success: true,
        message: 'Conexión a la base de datos exitosa',
        timing: {
          connectionTime: `${connectionTime}ms`,
          totalTime: `${totalTime}ms`,
        },
        stats: {
          estudiantes: countEstudiantes,
          comprobantes: countComprobantes,
          modulos: countModulos,
        },
        ejemplo: estudianteEjemplo
          ? {
              id: estudianteEjemplo.id,
              nombre: estudianteEjemplo.nombre,
              generacion: estudianteEjemplo.generacion,
              modulo: estudianteEjemplo.modulo?.nombre,
            }
          : null,
      };
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error('[Test DB] ✗ Error en la prueba de conexión:', error);
      console.error('[Test DB] Detalles del error:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      });

      return {
        success: false,
        message: 'Error al conectar con la base de datos',
        error: error instanceof Error ? error.message : String(error),
        timing: {
          totalTime: `${totalTime}ms`,
        },
      };
    }
  }
}
