/**
 * Mock data para la vista de ADMIN
 * Estos datos son temporales hasta que el backend proporcione un endpoint
 */

export interface EstudiantePago {
  id: string;
  nombreEstudiante: string;
  modulo: string;
  generacion: string;
  abono: number;
  montoTotal: number;
}

/**
 * Mock data de estudiantes con comprobantes subidos
 */
export const MOCK_ESTUDIANTES_PAGOS: EstudiantePago[] = [
  {
    id: '1',
    nombreEstudiante: 'Juan Pérez',
    modulo: 'Módulo 1',
    generacion: 'generacion 1',
    abono: 150.00,
    montoTotal: 300.00,
  },
  {
    id: '2',
    nombreEstudiante: 'María González',
    modulo: 'Módulo 2',
    generacion: 'generacion 1',
    abono: 200.00,
    montoTotal: 400.00,
  },
  {
    id: '3',
    nombreEstudiante: 'Carlos Rodríguez',
    modulo: 'Módulo 1',
    generacion: 'generacion 2',
    abono: 175.50,
    montoTotal: 350.00,
  },
  {
    id: '4',
    nombreEstudiante: 'Ana Martínez',
    modulo: 'Módulo 3',
    generacion: 'generacion 2',
    abono: 250.00,
    montoTotal: 500.00,
  },
  {
    id: '5',
    nombreEstudiante: 'Luis Fernández',
    modulo: 'Módulo 2',
    generacion: 'generacion 3',
    abono: 180.00,
    montoTotal: 360.00,
  },
];
