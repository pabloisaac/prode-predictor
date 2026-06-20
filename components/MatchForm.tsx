'use client';

import { useState } from 'react';
import { MatchInput } from '@/types/simulation';

const PHASES = [
  'Fase de grupos',
  'Octavos de final',
  'Cuartos de final',
  'Semifinal',
  'Final',
  'Tercer puesto',
];

interface Props {
  onSubmit: (data: MatchInput) => void;
  loading: boolean;
}

export default function MatchForm({ onSubmit, loading }: Props) {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [phase, setPhase] = useState('Fase de grupos');
  const [tacticalContext, setTacticalContext] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam.trim() || !awayTeam.trim()) return;
    onSubmit({ homeTeam: homeTeam.trim(), awayTeam: awayTeam.trim(), phase, tacticalContext });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Teams row */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Equipo Local
          </label>
          <input
            type="text"
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            placeholder="ej. Argentina"
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 placeholder:normal-case uppercase focus:outline-none focus:border-[#00E676] transition-colors text-lg font-semibold"
            disabled={loading}
          />
        </div>

        <div className="text-center text-2xl font-black text-gray-600 hidden md:block">VS</div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Equipo Visitante
          </label>
          <input
            type="text"
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            placeholder="ej. Brasil"
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 placeholder:normal-case uppercase focus:outline-none focus:border-[#00E676] transition-colors text-lg font-semibold"
            disabled={loading}
          />
        </div>
      </div>

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
              onClick={() => setPhase(p)}
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
        disabled={loading || !homeTeam.trim() || !awayTeam.trim()}
        className="w-full py-4 rounded-lg font-bold text-base tracking-wide transition-all
          bg-[#00E676] text-black hover:bg-[#00ff88] disabled:opacity-30 disabled:cursor-not-allowed
          active:scale-[0.98]"
      >
        {loading ? 'Analizando...' : '⚽ Simular partido'}
      </button>
    </form>
  );
}
