import { SimulationResult } from '@/types/simulation';

const MAX_GOALS = 8;

function poissonPmf(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 1; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

function dcAdjustment(
  i: number,
  j: number,
  lambdaHome: number,
  lambdaAway: number,
  rho: number
): number {
  if (i === 0 && j === 0) return 1 - lambdaHome * lambdaAway * rho;
  if (i === 0 && j === 1) return 1 + lambdaHome * rho;
  if (i === 1 && j === 0) return 1 + lambdaAway * rho;
  if (i === 1 && j === 1) return 1 - rho;
  return 1.0;
}

/** Builds a normalized, Dixon-Coles-adjusted score-probability matrix, flattened to a CDF. */
function buildCdf(lamHome: number, lamAway: number, rho: number): Float64Array {
  const flat = new Float64Array((MAX_GOALS + 1) * (MAX_GOALS + 1));
  let total = 0;
  let idx = 0;
  for (let i = 0; i <= MAX_GOALS; i++) {
    for (let j = 0; j <= MAX_GOALS; j++) {
      const p =
        poissonPmf(i, lamHome) *
        poissonPmf(j, lamAway) *
        dcAdjustment(i, j, lamHome, lamAway, rho);
      flat[idx++] = p;
      total += p;
    }
  }
  // Normalize and turn into cumulative distribution
  let acc = 0;
  for (let k = 0; k < flat.length; k++) {
    acc += flat[k] / total;
    flat[k] = acc;
  }
  return flat;
}

// Deterministic PRNG (mulberry32) so results are reproducible for the same inputs.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Samples from a triangular distribution with the given low/mode/high. */
function sampleTriangular(lo: number, mode: number, hi: number, u: number): number {
  if (hi <= lo) return mode;
  const c = (mode - lo) / (hi - lo);
  if (u < c) return lo + Math.sqrt(u * (hi - lo) * (mode - lo));
  return hi - Math.sqrt((1 - u) * (hi - lo) * (hi - mode));
}

function binarySearchCdf(cdf: Float64Array, r: number): number {
  let lo = 0;
  let hi = cdf.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cdf[mid] < r) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export interface SimulationOptions {
  lamHomeRange?: [number, number];
  lamAwayRange?: [number, number];
  simulations?: number;
  seed?: number;
}

/**
 * Monte Carlo simulation of the match. For each of N iterations it samples the
 * expected goals of each team from their plausible RANGE (triangular dist), then
 * draws a scoreline from the Dixon-Coles-adjusted Poisson for those goals. This
 * propagates calibration uncertainty into the final scoreline probabilities, so
 * the proposed results are robust rather than relying on a single point estimate.
 */
export function runSimulation(
  lamHome: number,
  lamAway: number,
  rho: number,
  opts: SimulationOptions = {}
): SimulationResult {
  const N = opts.simulations ?? 300_000;
  const [loH, hiH] = opts.lamHomeRange ?? [lamHome, lamHome];
  const [loA, hiA] = opts.lamAwayRange ?? [lamAway, lamAway];

  const rng = mulberry32(opts.seed ?? 0x9e3779b9);

  // Cache CDFs per rounded (lamHome, lamAway) pair so we don't rebuild matrices
  // on every iteration. Rounding to 0.02 keeps accuracy while bounding the cache.
  const cache = new Map<string, Float64Array>();
  const getCdf = (lh: number, la: number): Float64Array => {
    const rh = Math.round(lh / 0.02) * 0.02;
    const ra = Math.round(la / 0.02) * 0.02;
    const key = `${rh.toFixed(2)}_${ra.toFixed(2)}`;
    let cdf = cache.get(key);
    if (!cdf) {
      cdf = buildCdf(rh, ra, rho);
      cache.set(key, cdf);
    }
    return cdf;
  };

  const size = MAX_GOALS + 1;
  const counts = new Float64Array(size * size);

  for (let n = 0; n < N; n++) {
    const lh = sampleTriangular(loH, lamHome, hiH, rng());
    const la = sampleTriangular(loA, lamAway, hiA, rng());
    const cdf = getCdf(lh, la);
    const idx = binarySearchCdf(cdf, rng());
    counts[idx]++;
  }

  // Derive every metric from the simulated scoreline distribution (one source of truth)
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let over15 = 0;
  let over25 = 0;
  let over35 = 0;
  let btts = 0;
  let cleanSheetHome = 0;
  let cleanSheetAway = 0;
  let egHome = 0;
  let egAway = 0;
  const homeGoals = new Array(6).fill(0); // 0..4, 5 = "5+"
  const awayGoals = new Array(6).fill(0);
  const scoreMap: Map<string, number> = new Map();

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const p = counts[i * size + j] / N;
      if (p === 0) continue;
      const totalGoals = i + j;

      if (i > j) homeWin += p;
      else if (i === j) draw += p;
      else awayWin += p;

      if (totalGoals > 1.5) over15 += p;
      if (totalGoals > 2.5) over25 += p;
      if (totalGoals > 3.5) over35 += p;
      if (i > 0 && j > 0) btts += p;
      if (j === 0) cleanSheetHome += p;
      if (i === 0) cleanSheetAway += p;

      egHome += i * p;
      egAway += j * p;
      homeGoals[Math.min(i, 5)] += p;
      awayGoals[Math.min(j, 5)] += p;

      scoreMap.set(`${i}-${j}`, (scoreMap.get(`${i}-${j}`) ?? 0) + p);
    }
  }

  const topScores = Array.from(scoreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([score, prob]) => ({ score, prob }));

  const top3Coverage = topScores.slice(0, 3).reduce((s, x) => s + x.prob, 0);

  return {
    homeWin,
    draw,
    awayWin,
    over15,
    over25,
    over35,
    under15: 1 - over15,
    under25: 1 - over25,
    under35: 1 - over35,
    btts,
    cleanSheetHome,
    cleanSheetAway,
    topScores,
    top3Coverage,
    homeGoalsDist: homeGoals,
    awayGoalsDist: awayGoals,
    expectedGoalsHome: egHome,
    expectedGoalsAway: egAway,
    simulations: N,
  };
}
