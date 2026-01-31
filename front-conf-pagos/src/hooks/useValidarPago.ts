/**
 * Hook para validar un pago
 */

import { useState } from 'react';
import { validacionService, type ValidarPagoParams } from '@/services/validacion.service';
import type { ResultadoValidacion } from '@/types/api';

type ValidationStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseValidarPagoState {
  status: ValidationStatus;
  data: ResultadoValidacion | null;
  error: string | null;
}

export function useValidarPago() {
  const [state, setState] = useState<UseValidarPagoState>({
    status: 'idle',
    data: null,
    error: null,
  });

  const validar = async (params: ValidarPagoParams) => {
    setState({ status: 'loading', data: null, error: null });

    try {
      const resultado = await validacionService.validarPago(params);

      // El backend puede devolver valido: false, pero HTTP 200
      // Lo tratamos como éxito de la petición, pero el resultado puede ser inválido
      setState({
        status: 'success',
        data: resultado,
        error: null,
      });

      return resultado;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al validar el pago';
      setState({
        status: 'error',
        data: null,
        error: errorMessage,
      });
      throw error;
    }
  };

  const reset = () => {
    setState({ status: 'idle', data: null, error: null });
  };

  return {
    ...state,
    validar,
    reset,
  };
}
