export const GENERACIONES = [
  'generacion 1',
  'generacion 2',
  'generacion 3',
  'generacion 4',
  'generacion 5',
] as const;

export type Generacion = (typeof GENERACIONES)[number];
