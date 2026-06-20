export interface MatchInput {
  homeTeam: string;
  awayTeam: string;
  phase: string;
  tacticalContext: string;
}

export interface SimulationResult {
  homeWin: number;
  draw: number;
  awayWin: number;
  over15: number;
  over25: number;
  over35: number;
  under15: number;
  under25: number;
  under35: number;
  btts: number;
  cleanSheetHome: number;
  cleanSheetAway: number;
  topScores: Array<{ score: string; prob: number }>;
  top3Coverage: number;        // suma de prob de los 3 marcadores más probables
  homeGoalsDist: number[];     // P(local marca k goles), k = 0..4, último = 5+
  awayGoalsDist: number[];     // P(visitante marca k goles), k = 0..4, último = 5+
  expectedGoalsHome: number;
  expectedGoalsAway: number;
  simulations: number;         // cantidad de simulaciones Monte Carlo corridas
}

export interface Calibration {
  lamHome: number;
  lamAway: number;
  lamHomeRange: [number, number]; // rango plausible de goles esperados del local
  lamAwayRange: [number, number]; // rango plausible de goles esperados del visitante
  rho: number;
  reasoning: string;
  sources: string[];
}

export interface Narrative {
  context: string;
  confidence: 'ALTA' | 'MEDIA' | 'BAJA';
  confidenceReason: string;
  recommendation: string;
  aiPicks: Array<{ score: string; reason: string }>;
  warnings: string[];
}

export interface MarketComparison {
  homeWin?: number;
  draw?: number;
  awayWin?: number;
  source?: string;
}

export interface SimulationResponse {
  match: {
    home: string;
    away: string;
    phase: string;
    venue?: string;
  };
  calibration: Calibration;
  simulation: SimulationResult;
  narrative: Narrative;
  marketComparison: MarketComparison;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  match: { home: string; away: string; phase: string };
  result: SimulationResponse;
}
