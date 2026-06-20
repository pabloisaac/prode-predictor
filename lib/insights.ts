import { SimulationResult } from '@/types/simulation';

export interface PredictionLayer {
  label: string;       // e.g. "Gana Argentina"
  pick: string;        // short pick text
  prob: number;        // 0-1
  tier: 'ganador' | 'seguro' | 'marcador';
}

function riskBand(prob: number): { text: string; color: string } {
  if (prob >= 0.7) return { text: 'Riesgo bajo', color: '#00E676' };
  if (prob >= 0.5) return { text: 'Riesgo medio', color: '#FFC400' };
  return { text: 'Riesgo alto', color: '#FF5252' };
}

/**
 * How concentrated the scoreline distribution is. If the top 3 scorelines cover
 * a large share of all simulated outcomes, the goals prediction is "concentrada"
 * (more certain); if they cover little, the match is wide open.
 */
function coverageBand(top3Coverage: number): { text: string; color: string } {
  if (top3Coverage >= 0.42) return { text: 'Predicción concentrada', color: '#00E676' };
  if (top3Coverage >= 0.3) return { text: 'Predicción moderada', color: '#FFC400' };
  return { text: 'Partido muy abierto', color: '#FF5252' };
}

export { riskBand, coverageBand };

/**
 * Builds the 3-tier "layered prediction" from a simulation result.
 * Tier 1: most likely 1X2 outcome (the headline pick).
 * Tier 2: safest useful market bet (double chance / over-under / BTTS).
 * Tier 3: single most likely exact score.
 */
export function buildPredictionLayers(
  sim: SimulationResult,
  homeTeam: string,
  awayTeam: string
): PredictionLayer[] {
  // Tier 1 — winner
  const outcomes: PredictionLayer[] = [
    { label: `Gana ${homeTeam}`, pick: `${homeTeam}`, prob: sim.homeWin, tier: 'ganador' },
    { label: 'Empate', pick: 'Empate', prob: sim.draw, tier: 'ganador' },
    { label: `Gana ${awayTeam}`, pick: `${awayTeam}`, prob: sim.awayWin, tier: 'ganador' },
  ];
  const winner = outcomes.reduce((a, b) => (b.prob > a.prob ? b : a));

  // Tier 2 — safest bet: pick the highest-probability "useful" market
  const safeCandidates: PredictionLayer[] = [
    { label: `${homeTeam} no pierde`, pick: `${homeTeam} o empate`, prob: sim.homeWin + sim.draw, tier: 'seguro' },
    { label: `${awayTeam} no pierde`, pick: `${awayTeam} o empate`, prob: sim.awayWin + sim.draw, tier: 'seguro' },
    { label: 'No empata', pick: `${homeTeam} o ${awayTeam}`, prob: sim.homeWin + sim.awayWin, tier: 'seguro' },
    { label: 'Más de 1.5 goles', pick: 'Over 1.5', prob: sim.over15, tier: 'seguro' },
    { label: 'Menos de 1.5 goles', pick: 'Under 1.5', prob: sim.under15, tier: 'seguro' },
    { label: 'Más de 2.5 goles', pick: 'Over 2.5', prob: sim.over25, tier: 'seguro' },
    { label: 'Menos de 2.5 goles', pick: 'Under 2.5', prob: sim.under25, tier: 'seguro' },
    { label: 'Ambos anotan', pick: 'BTTS Sí', prob: sim.btts, tier: 'seguro' },
    { label: 'No ambos anotan', pick: 'BTTS No', prob: 1 - sim.btts, tier: 'seguro' },
  ];
  // Exclude the trivially-redundant "no pierde" of the strong favorite if it's
  // basically the same as the winner pick; prefer the most informative bet >= 0.65.
  const safest = safeCandidates
    .filter((c) => c.prob < 0.96) // avoid near-certain trivial picks
    .reduce((a, b) => (b.prob > a.prob ? b : a));

  // Tier 3 — exact score
  const top = sim.topScores[0];
  const scoreLayer: PredictionLayer = {
    label: 'Marcador más probable',
    pick: top ? top.score.replace('-', ' - ') : '–',
    prob: top ? top.prob : 0,
    tier: 'marcador',
  };

  return [winner, safest, scoreLayer];
}
