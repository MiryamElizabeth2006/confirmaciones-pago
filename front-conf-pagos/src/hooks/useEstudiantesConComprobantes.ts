/**
 * Hook para obtener estudiantes con comprobantes (para tabla ADMIN)
 */

import { useState, useEffect } from 'react';
import { estudiantesService } from '@/services/estudiantes.service';
import type { EstudiantesConComprobantes } from '@/types/api';

interface UseEstudiantesConComprobantesState {
  data: EstudiantesConComprobantes | null;
  loading: boolean;
  error: string | null;
}

export function useEstudiantesConComprobantes() {
  const [state, setState] = useState<UseEstudiantesConComprobantesState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchEstudiantes() {
      try {
        setState({ data: null, loading: true, error: null });
        const estudiantes = await estudiantesService.obtenerConComprobantes();

        if (!cancelled) {
          // Asegurar que siempre sea un array
          const estudiantesArray = Array.isArray(estudiantes) ? estudiantes : [];
          setState({ data: estudiantesArray, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error al cargar estudiantes:', error);
          const errorMessage =
            error instanceof Error ? error.message : 'Error al cargar los estudiantes';
          setState({ data: [], loading: false, error: errorMessage });
        }
      }
    }

    fetchEstudiantes();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
