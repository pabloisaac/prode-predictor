export const GRUPOS: Record<string, string[]> = {
  A: ['México', 'Sudáfrica', 'Corea del Sur', 'República Checa'],
  B: ['Canadá', 'Bosnia y Herzegovina', 'Catar', 'Suiza'],
  C: ['Brasil', 'Marruecos', 'Haití', 'Escocia'],
  D: ['Estados Unidos', 'Paraguay', 'Australia', 'Turquía'],
  E: ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador'],
  F: ['Países Bajos', 'Japón', 'Suecia', 'Túnez'],
  G: ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda'],
  H: ['España', 'Cabo Verde', 'Arabia Saudita', 'Uruguay'],
  I: ['Francia', 'Senegal', 'Irak', 'Noruega'],
  J: ['Argentina', 'Argelia', 'Austria', 'Jordania'],
  K: ['Portugal', 'República Democrática del Congo', 'Uzbekistán', 'Colombia'],
  L: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'],
};

export const TODOS_LOS_EQUIPOS = Object.values(GRUPOS).flat().sort((a, b) => a.localeCompare(b, 'es'));

export function getGrupoDeEquipo(equipo: string): string | null {
  for (const [grupo, equipos] of Object.entries(GRUPOS)) {
    if (equipos.includes(equipo)) return grupo;
  }
  return null;
}
