'use client';

import { useState } from 'react';
import { MatchInput } from '@/types/simulation';
import { GRUPOS, TODOS_LOS_EQUIPOS, getGrupoDeEquipo } from '@/lib/grupos';

const PHASES = [
  'Fase de grupos',
  'Octavos de final',
  'Cuartos de final',
  'Semifinal',
  'Final',
  'Tercer puesto',
];

const FASE_GRUPOS = 'Fase de grupos';

interface Props {
  onSubmit: (data: MatchInput) => void;
  loading: boolean;
}

export default function MatchForm({ onSubmit, loading }: Props) {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [phase, setPhase] = useState(FASE_GRUPOS);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [tacticalContext, setTacticalContext] = useState('');

  const esFaseGrupos = phase === FASE_GRUPOS;

  const equiposDisponibles: string[] =
    esFaseGrupos && selectedGroup ? GRUPOS[selectedGroup] : TODOS_LOS_EQUIPOS;

  const opcionesLocal = equiposDisponibles.filter((e) => e !== awayTeam);
  const opcionesVisitante = equiposDisponibles.filter((e) => e !== homeTeam);

  const handlePhaseChange = (p: string) => {
    setPhase(p);
    setHomeTeam('');
    setAwayTeam('');
    if (p !== FASE_GRUPOS) setSelectedGroup('');
  };

  const handleGroupChange = (g: string) => {
    setSelectedGroup(g);
    setHomeTeam('');
    setAwayTeam('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam || !awayTeam) return;
    onSubmit({ homeTeam, awayTeam, phase, tacticalContext });
  };

  const grupoHomeTeam = homeTeam ? getGrupoDeEquipo(homeTeam) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Phase */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Fase del torneo
        </label>
        <div className="flex flex-wrap gap-2">
          {PHASES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePhaseChange(p)}
              disabled={loading}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                phase === p
                  ? 'bg-[#00E676] text-black border-[#00E676] font-bold'
                  : 'bg-transparent text-gray-400 border-[#333] hover:border-gray-500'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Group selector (only in fase de grupos) */}
      {esFaseGrupos && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Grupo
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(GRUPOS).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleGroupChange(g)}
                disabled={loading}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all border ${
                  selectedGroup === g
                    ? 'bg-[#00E676] text-black border-[#00E676]'
                    : 'bg-transparent text-gray-400 border-[#333] hover:border-gray-500'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          {selectedGroup && (
            <p className="text-xs text-gray-600">
              {GRUPOS[selectedGroup].join(' · ')}
            </p>
          )}
        </div>
      )}

      {/* Teams row */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Equipo Local
          </label>
          <select
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            disabled={loading || (esFaseGrupos && !selectedGroup)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00E676] transition-colors text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed appearance-none"
          >
            <option value="">
              {esFaseGrupos && !selectedGroup ? 'Elegí un grupo primero' : 'Seleccioná equipo'}
            </option>
            {opcionesLocal.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        <div className="text-center text-2xl font-black text-gray-600 hidden md:block">VS</div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Equipo Visitante
          </label>
          <select
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            disabled={loading || (esFaseGrupos && !selectedGroup) || !homeTeam}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00E676] transition-colors text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed appearance-none"
          >
            <option value="">
              {!homeTeam ? 'Elegí el local primero' : 'Seleccioná equipo'}
            </option>
            {opcionesVisitante.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Group tag for knockout phase */}
      {!esFaseGrupos && homeTeam && awayTeam && (
        <div className="flex gap-3 text-xs text-gray-600">
          {grupoHomeTeam && (
            <span>
              {homeTeam}: <span className="text-gray-400">Grupo {grupoHomeTeam}</span>
            </span>
          )}
          {awayTeam && getGrupoDeEquipo(awayTeam) && (
            <span>
              {awayTeam}: <span className="text-gray-400">Grupo {getGrupoDeEquipo(awayTeam)}</span>
            </span>
          )}
        </div>
      )}

      {/* Tactical context */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Contexto táctico{' '}
          <span className="text-gray-600 normal-case font-normal">(opcional)</span>
        </label>
        <textarea
          value={tacticalContext}
          onChange={(e) => setTacticalContext(e.target.value)}
          placeholder="ej. Local necesita ganar para avanzar. Visitante llega con tres bajas importantes en defensa..."
          rows={3}
          disabled={loading}
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00E676] transition-colors resize-none text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !homeTeam || !awayTeam}
        className="w-full py-4 rounded-lg font-bold text-base tracking-wide transition-all
          bg-[#00E676] text-black hover:bg-[#00ff88] disabled:opacity-30 disabled:cursor-not-allowed
          active:scale-[0.98]"
      >
        {loading ? 'Analizando...' : '⚽ Simular partido'}
      </button>
    </form>
  );
}
