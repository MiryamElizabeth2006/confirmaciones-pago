import type { PagoRegistrado } from '../value-objects/pago-registrado.vo';

/**
 * Puerto (driven): lectura del registro de pagos (ej. desde Excel).
 * El dominio no conoce el formato de almacenamiento.
 */
export interface LeerPagosRegistradosPort {
  leerTodos(): Promise<PagoRegistrado[]>;
}
