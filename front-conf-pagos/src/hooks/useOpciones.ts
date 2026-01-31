/**
 * Hook para obtener y manejar las opciones del formulario
 */

import { useState, useEffect } from 'react';
import { opcionesService } from '@/services/opciones.service';
import type { OpcionesSelect } from '@/types/api';

interface UseOpcionesState {
  data: OpcionesSelect | null;
  loading: boolean;
  error: string | null;
}

export function useOpciones() {
  const [state, setState] = useState<UseOpcionesState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchOpciones() {
      try {
        setState({ data: null, loading: true, error: null });
        const opciones = await opcionesService.obtenerOpciones();

        if (!cancelled) {
          setState({ data: opciones, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          const errorMessage =
            error instanceof Error ? error.message : 'Error al cargar las opciones';
          setState({ data: null, loading: false, error: errorMessage });
        }
      }
    }

    fetchOpciones();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
