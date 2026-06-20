'use client';

import { useState } from 'react';
import { SimulationResponse } from '@/types/simulation';
import { coverageBand } from '@/lib/insights';
import ProbabilityChart from './ProbabilityChart';
import ScoresGrid from './ScoresGrid';
import MarketsTable from './MarketsTable';
import ConfidenceBadge from './ConfidenceBadge';

interface Props {
  result: SimulationResponse;
  onReset: () => void;
  onShare: () => void;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Collapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#161616] transition-colors"
      >
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</span>
        <span className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      {open && <div className="px-5 pb-5 pt-1 animate-fade-in">{children}</div>}
    </div>
  );
}

/** Per-team goals distribution: P(team scores 0,1,2,3,4,5+). */
function GoalsDistribution({
  dist,
  team,
  color,
  expected,
  range,
}: {
  dist: number[];
  team: string;
  color: string;
  expected: number;
  range: [number, number];
}) {
  const max = Math.max(...dist);
  const labels = ['0', '1', '2', '3', '4', '5+'];
  // Most likely number of goals for this team
  const mlIdx = dist.indexOf(max);
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="font-bold text-white uppercase">{team}</span>
        <span className="text-xs text-gray-500">
          esperado <span className="font-bold" style={{ color }}>{expected.toFixed(2)}</span>{' '}
          <span className="text-gray-600">({range[0].toFixed(1)}–{range[1].toFixed(1)})</span>
        </span>
      </div>
      <div className="flex items-end gap-1.5 h-24">
        {dist.map((p, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
            <span className="text-[10px] font-bold" style={{ color: i === mlIdx ? color : '#6b7280' }}>
              {(p * 100).toFixed(0)}%
            </span>
            <div
              className="w-full rounded-t transition-all duration-700"
              style={{
                height: `${(p / max) * 100}%`,
                backgroundColor: i === mlIdx ? color : '#2a2a2a',
                minHeight: '2px',
              }}
            />
            <span className="text-[10px] text-gray-500">{labels[i]}</span>
          </div>
        ))}
      </div>
      <div className="text-[11px] text-gray-500 text-center">
        Más probable: <span className="font-bold" style={{ color }}>{labels[mlIdx]} {labels[mlIdx] === '1' ? 'gol' : 'goles'}</span>
      </div>
    </div>
  );
}

export default function SimulationResults({ result, onReset, onShare }: Props) {
  const { match, calibration, simulation, narrative, marketComparison } = result;
  const top3 = simulation.topScores.slice(0, 3);
  // Fallbacks for legacy history entries saved before these fields existed
  const top3Coverage = simulation.top3Coverage ?? top3.reduce((s, x) => s + x.prob, 0);
  const simCount = simulation.simulations ?? 300_000;
  const hasGoalsDist =
    Array.isArray(simulation.homeGoalsDist) && Array.isArray(simulation.awayGoalsDist);
  const cov = coverageBand(top3Coverage);

  // Defensive normalization for legacy history entries with percentage-scale market values
  const mc = {
    homeWin: marketComparison.homeWin != null && marketComparison.homeWin > 1 ? marketComparison.homeWin / 100 : marketComparison.homeWin,
    draw: marketComparison.draw != null && marketComparison.draw > 1 ? marketComparison.draw / 100 : marketComparison.draw,
    awayWin: marketComparison.awayWin != null && marketComparison.awayWin > 1 ? marketComparison.awayWin / 100 : marketComparison.awayWin,
    source: marketComparison.source,
  };

  // Legacy entries may not carry the new range fields
  const rangeH: [number, number] = calibration.lamHomeRange ?? [calibration.lamHome, calibration.lamHome];
  const rangeA: [number, number] = calibration.lamAwayRange ?? [calibration.lamAway, calibration.lamAway];

  const rankColors = ['#00E676', '#4FC3F7', '#9575CD'];

  // Most likely number of goals for each team (mode of its goal distribution)
  const goalLabels = ['0', '1', '2', '3', '4', '5+'];
  const homeMlIdx = hasGoalsDist
    ? simulation.homeGoalsDist.indexOf(Math.max(...simulation.homeGoalsDist))
    : -1;
  const awayMlIdx = hasGoalsDist
    ? simulation.awayGoalsDist.indexOf(Math.max(...simulation.awayGoalsDist))
    : -1;
  const [topH, topA] = (top3[0]?.score ?? '0-0').split('-');

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Match header */}
      <div className="text-center">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
          {match.phase} · Mundial 2026
        </div>
        <div className="text-2xl md:text-3xl font-black text-white uppercase">
          {match.home} <span className="text-gray-600 mx-1 lowercase">vs</span> {match.away}
        </div>
      </div>

      {/* === MARCADOR SUGERIDO PARA EL PRODE (hero principal) === */}
      <div className="bg-gradient-to-b from-[#0d1a12] to-[#0d130f] border border-[#00E676]/40 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#00E676] uppercase tracking-widest">
            ⚽ Marcador sugerido
          </h3>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">para el prode</span>
        </div>

        {/* Big scoreline: goals per team */}
        <div className="flex items-center justify-center gap-4 md:gap-8 py-2">
          <div className="text-center flex-1 min-w-0">
            <div className="text-sm md:text-base font-bold text-gray-300 uppercase truncate mb-1">
              {match.home}
            </div>
            <div className="text-6xl md:text-7xl font-black text-[#00E676] tabular-nums leading-none">
              {topH}
            </div>
          </div>
          <div className="text-3xl font-black text-gray-700 pt-6">-</div>
          <div className="text-center flex-1 min-w-0">
            <div className="text-sm md:text-base font-bold text-gray-300 uppercase truncate mb-1">
              {match.away}
            </div>
            <div className="text-6xl md:text-7xl font-black text-[#4FC3F7] tabular-nums leading-none">
              {topA}
            </div>
          </div>
        </div>

        <div className="text-center">
          <span className="text-xs text-gray-500">
            Es el marcador más probable de las {simCount.toLocaleString('es-AR')} simulaciones —{' '}
            <span className="font-bold text-gray-300">{(top3[0].prob * 100).toFixed(1)}%</span> de las veces
          </span>
        </div>

        {/* Per-team most-likely goal count */}
        {hasGoalsDist && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl bg-[#0a0a0a]/60 border border-[#222] p-3 text-center">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Goles {match.home}
              </div>
              <div className="text-sm text-gray-300">
                Más probable:{' '}
                <span className="font-black text-[#00E676]">
                  {goalLabels[homeMlIdx]} {homeMlIdx === 1 ? 'gol' : 'goles'}
                </span>{' '}
                <span className="text-gray-500">
                  ({(simulation.homeGoalsDist[homeMlIdx] * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-[#0a0a0a]/60 border border-[#222] p-3 text-center">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Goles {match.away}
              </div>
              <div className="text-sm text-gray-300">
                Más probable:{' '}
                <span className="font-black text-[#4FC3F7]">
                  {goalLabels[awayMlIdx]} {awayMlIdx === 1 ? 'gol' : 'goles'}
                </span>{' '}
                <span className="text-gray-500">
                  ({(simulation.awayGoalsDist[awayMlIdx] * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>
        )}

        <p className="text-[11px] text-gray-500 leading-relaxed">
          Mirá la distribución completa de goles por equipo más abajo para ajustar tu pronóstico.
          Tené en cuenta: acertar el marcador exacto es difícil (ningún resultado supera ~15%),
          así que abajo tenés los otros candidatos.
        </p>
      </div>

      {/* === 3 MARCADORES EXACTOS (alto riesgo) === */}
      <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
            🎯 Marcadores exactos más probables
          </h3>
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider bg-red-400/10 border border-red-400/30 rounded-full px-2 py-0.5">
            Alto riesgo
          </span>
        </div>

        <p className="text-[11px] text-gray-500 leading-relaxed -mt-1">
          En fútbol ningún marcador exacto supera ~15%: hay decenas de resultados posibles y la
          probabilidad se reparte. Estos son los 3 mejores candidatos, pero acertar el marcador
          justo siempre es una apuesta arriesgada (paga más, justamente por eso).
        </p>

        <div className="grid grid-cols-3 gap-3">
          {top3.map((s, idx) => {
            const [h, a] = s.score.split('-');
            return (
              <div
                key={s.score}
                className={`rounded-xl p-3 text-center border ${
                  idx === 0 ? 'bg-[#00E676]/10 border-[#00E676]/40' : 'bg-[#0a0a0a]/60 border-[#222]'
                }`}
              >
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {idx === 0 ? 'Top' : `#${idx + 1}`}
                </div>
                <div className="text-2xl md:text-3xl font-black text-white tabular-nums">
                  {h}<span className="text-gray-600 mx-0.5">-</span>{a}
                </div>
                <div
                  className="text-base font-black mt-1"
                  style={{ color: rankColors[idx] }}
                >
                  {(s.prob * 100).toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Combined certainty */}
        <div className="rounded-xl bg-[#0a0a0a]/60 border border-[#222] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Estos 3 marcadores cubren</span>
            <span className="text-xl font-black" style={{ color: cov.color }}>
              {(top3Coverage * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${top3Coverage * 100}%`, backgroundColor: cov.color }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: cov.color }}>
              {cov.text}
            </span>
            <span className="text-[11px] text-gray-600">de todos los escenarios simulados</span>
          </div>
        </div>

        <p className="text-[11px] text-gray-500 leading-relaxed">
          Basado en {simCount.toLocaleString('es-AR')} simulaciones Monte Carlo, propagando la
          incertidumbre del xG de cada equipo. Si vas a jugar marcador exacto, el #1 es el mejor
          candidato — pero ya viste arriba cuál es la apuesta segura.
        </p>
      </div>

      {/* === GOLES POR EQUIPO (lo central) === */}
      {hasGoalsDist && (
      <Card title="Distribución de goles por equipo">
        <div className="grid md:grid-cols-2 gap-6">
          <GoalsDistribution
            dist={simulation.homeGoalsDist}
            team={match.home}
            color="#00E676"
            expected={simulation.expectedGoalsHome}
            range={rangeH}
          />
          <GoalsDistribution
            dist={simulation.awayGoalsDist}
            team={match.away}
            color="#4FC3F7"
            expected={simulation.expectedGoalsAway}
            range={rangeA}
          />
        </div>
      </Card>
      )}

      {/* === SUGERENCIA DEL ANALISTA (IA) === */}
      {narrative.aiPicks && narrative.aiPicks.length > 0 && (
        <div className="bg-[#120e1a] border border-[#9575CD]/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#B39DDB] uppercase tracking-widest">
              🧠 Sugerencia del analista (IA)
            </h3>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">criterio futbolero</span>
          </div>
          <div className="space-y-2">
            {narrative.aiPicks.map((p, idx) => {
              const [h, a] = p.score.split('-');
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-4 rounded-xl p-3 border ${
                    idx === 0 ? 'bg-[#9575CD]/10 border-[#9575CD]/40' : 'bg-[#0a0a0a]/60 border-[#222]'
                  }`}
                >
                  <div className="text-xl font-black text-white tabular-nums shrink-0 w-16 text-center">
                    {h}<span className="text-gray-600 mx-0.5">-</span>{a}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-[#B39DDB] uppercase tracking-wider">
                      {idx === 0 ? 'Su favorito' : `Alternativa ${idx}`}
                    </div>
                    <div className="text-sm text-gray-300 leading-snug">{p.reason}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Esta es la mirada cualitativa de la IA, que pesa contexto, presión y tácticas que el
            modelo estadístico no capta. Cruzala con los 3 resultados de arriba: si coinciden, más
            confianza; si difieren, tenés dos escenarios para elegir.
          </p>
        </div>
      )}

      {/* === Recommendation + confidence === */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Recomendación para el prode
          </h3>
          <ConfidenceBadge level={narrative.confidence} reason={narrative.confidenceReason} />
        </div>
        <p className="text-base text-gray-200 leading-relaxed">{narrative.recommendation}</p>

        {narrative.warnings.length > 0 && (
          <div className="pt-3 border-t border-[#222]">
            <div className="text-xs text-yellow-500 uppercase tracking-widest mb-2">
              ⚠ Por qué no es certero
            </div>
            <ul className="space-y-1.5">
              {narrative.warnings.map((w, i) => (
                <li key={i} className="text-sm text-yellow-300/80 flex gap-2">
                  <span>›</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 1X2 probabilities */}
      <Card title="Probabilidades del resultado (1X2)">
        <ProbabilityChart
          homeWin={simulation.homeWin}
          draw={simulation.draw}
          awayWin={simulation.awayWin}
          homeTeam={match.home}
          awayTeam={match.away}
        />
      </Card>

      {/* === Collapsible detail === */}
      <Collapsible title="Top 10 marcadores exactos">
        <ScoresGrid topScores={simulation.topScores} homeTeam={match.home} awayTeam={match.away} />
      </Collapsible>

      <Collapsible title="Mercados de goles y especiales">
        <MarketsTable sim={simulation} homeTeam={match.home} awayTeam={match.away} />
      </Collapsible>

      {(mc.homeWin || mc.draw || mc.awayWin) && (
        <Collapsible title={`Comparación vs mercado${mc.source ? ` · ${mc.source}` : ''}`}>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: match.home, model: simulation.homeWin, market: mc.homeWin },
              { label: 'Empate', model: simulation.draw, market: mc.draw },
              { label: match.away, model: simulation.awayWin, market: mc.awayWin },
            ].map(({ label, model, market }) => (
              <div key={label} className="space-y-1">
                <div className="text-xs text-gray-500 truncate">{label}</div>
                <div className="text-lg font-black text-white">{(model * 100).toFixed(1)}%</div>
                <div className="text-xs text-gray-500">Modelo</div>
                {market != null && (
                  <>
                    <div className="text-sm font-bold text-yellow-400">{(market * 100).toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">Mercado</div>
                    <div
                      className={`text-xs font-bold ${
                        Math.abs(model - market) > 0.05 ? 'text-[#00E676]' : 'text-gray-400'
                      }`}
                    >
                      {model > market ? '+' : ''}
                      {((model - market) * 100).toFixed(1)}pp
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">
            Diferencias grandes (verde) marcan dónde el modelo ve valor frente a las casas de apuestas.
          </p>
        </Collapsible>
      )}

      <Collapsible title="Calibración del modelo (xG y razonamiento)">
        <div className="space-y-4">
          <div className="flex gap-6 text-center">
            <div className="flex-1">
              <div className="text-2xl font-black text-[#00E676]">{calibration.lamHome.toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-1">λ {match.home}</div>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-black text-gray-400">{calibration.rho.toFixed(3)}</div>
              <div className="text-xs text-gray-500 mt-1">ρ Dixon-Coles</div>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-black text-[#4FC3F7]">{calibration.lamAway.toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-1">λ {match.away}</div>
            </div>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{calibration.reasoning}</p>
          {calibration.sources.length > 0 && (
            <div className="pt-2 border-t border-[#222]">
              <div className="text-xs text-gray-500 mb-2 uppercase tracking-widest">
                Fuentes consultadas
              </div>
              <ul className="space-y-1">
                {calibration.sources.map((s, i) => (
                  <li key={i} className="text-xs text-gray-400 flex gap-2">
                    <span className="text-[#00E676]">›</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Collapsible>

      {narrative.context && (
        <Collapsible title="Contexto del partido">
          <p className="text-sm text-gray-300 leading-relaxed">{narrative.context}</p>
        </Collapsible>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onReset}
          className="flex-1 py-3 rounded-lg font-bold text-sm border border-[#333] text-gray-300 hover:border-gray-500 transition-colors"
        >
          ← Nuevo partido
        </button>
        <button
          onClick={onShare}
          className="flex-1 py-3 rounded-lg font-bold text-sm border border-[#00E676]/40 text-[#00E676] hover:bg-[#00E676]/10 transition-colors"
        >
          ↑ Compartir
        </button>
      </div>
    </div>
  );
}
