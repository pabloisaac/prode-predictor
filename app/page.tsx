'use client';

import { useState, useEffect } from 'react';
import MatchForm from '@/components/MatchForm';
import SimulationResults from '@/components/SimulationResults';
import { MatchInput, SimulationResponse, HistoryEntry } from '@/types/simulation';
import { buildPredictionLayers } from '@/lib/insights';

type LoadingStep = 'search' | 'calibrate' | 'simulate' | 'done';

const STEPS: { key: LoadingStep; icon: string; label: string }[] = [
  { key: 'search', icon: '🔍', label: 'Buscando datos del partido...' },
  { key: 'calibrate', icon: '📊', label: 'Calibrando modelo xG...' },
  { key: 'simulate', icon: '🎲', label: 'Corriendo 300.000 simulaciones...' },
  { key: 'done', icon: '✅', label: 'Análisis listo' },
];

const HISTORY_KEY = 'mundial_history';
const MAX_HISTORY = 5;

function LoadingScreen({ currentStep }: { currentStep: LoadingStep }) {
  const currentIdx = STEPS.findIndex((s) => s.key === currentStep);
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-8 space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-2 animate-bounce">{STEPS[currentIdx]?.icon}</div>
        <p className="text-gray-300 font-medium">{STEPS[currentIdx]?.label}</p>
      </div>
      <div className="space-y-3">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done
                    ? 'bg-[#00E676] text-black'
                    : active
                    ? 'border-2 border-[#00E676] animate-pulse'
                    : 'border-2 border-[#333]'
                }`}
              >
                {done ? '✓' : ''}
              </div>
              <span
                className={`text-sm transition-all ${
                  done ? 'text-[#00E676]' : active ? 'text-white font-medium' : 'text-gray-600'
                }`}
              >
                {step.icon} {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-600 text-center">
        Esto puede tardar hasta 60 segundos mientras Claude busca datos reales
      </p>
    </div>
  );
}

function HistoryPanel({
  history,
  onSelect,
  onClear,
}: {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}) {
  if (history.length === 0) return null;
  return (
    <div className="bg-[#0d0d0d] border border-[#222] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Historial reciente
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Limpiar
        </button>
      </div>
      <div className="space-y-2">
        {history.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelect(entry)}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                {entry.match.home} vs {entry.match.away}
              </span>
              <span className="text-xs text-gray-600">{entry.match.phase}</span>
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              {new Date(entry.timestamp).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<'form' | 'loading' | 'results'>('form');
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('search');
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const saveToHistory = (entry: HistoryEntry) => {
    const updated = [entry, ...history.filter((h) => h.id !== entry.id)].slice(0, MAX_HISTORY);
    setHistory(updated);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const simulateLoadingSteps = () => {
    setLoadingStep('search');
    setTimeout(() => setLoadingStep('calibrate'), 8000);
    setTimeout(() => setLoadingStep('simulate'), 20000);
  };

  const handleSubmit = async (data: MatchInput) => {
    setView('loading');
    setError(null);
    simulateLoadingSteps();

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Error desconocido.');
        setView('form');
        return;
      }

      setLoadingStep('done');
      setTimeout(() => {
        setResult(json);
        setView('results');
        saveToHistory({
          id: `${Date.now()}`,
          timestamp: Date.now(),
          match: { home: json.match.home, away: json.match.away, phase: json.match.phase },
          result: json,
        });
      }, 800);
    } catch {
      setError('Error de red. Verificá tu conexión.');
      setView('form');
    }
  };

  const handleShare = async () => {
    if (!result) return;
    const { match, simulation, narrative } = result;
    const safest = buildPredictionLayers(simulation, match.home, match.away)[1];
    const top3 = simulation.topScores.slice(0, 3);
    const scoreLines = top3
      .map((s, i) => {
        const [h, a] = s.score.split('-');
        return `${i + 1}. ${match.home} ${h}-${a} ${match.away} — ${(s.prob * 100).toFixed(1)}%`;
      })
      .join('\n');
    const text = `⚽ Mundial 2026 Predictor
${match.home} vs ${match.away} — ${match.phase}

🔢 3 resultados más probables:
${scoreLines}
(estos 3 cubren ${(simulation.top3Coverage * 100).toFixed(0)}% de los escenarios)

🛡️ Más seguro: ${safest.label} (${(safest.prob * 100).toFixed(0)}%)

📌 ${narrative.recommendation}
Confianza: ${narrative.confidence}

#Mundial2026 #Prode`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-xs font-bold text-[#00E676] uppercase tracking-widest">
            Mundial 2026
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">⚽ Predictor</h1>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Simulación Monte Carlo con datos reales buscados por IA
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-950/50 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Copied toast */}
        {copied && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#00E676] text-black font-bold text-sm px-5 py-2.5 rounded-full shadow-lg z-50">
            ✓ Análisis copiado
          </div>
        )}

        {view === 'form' && (
          <>
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <MatchForm onSubmit={handleSubmit} loading={false} />
            </div>
            <HistoryPanel
              history={history}
              onSelect={(entry) => {
                setResult(entry.result);
                setView('results');
              }}
              onClear={() => {
                setHistory([]);
                localStorage.removeItem(HISTORY_KEY);
              }}
            />
          </>
        )}

        {view === 'loading' && <LoadingScreen currentStep={loadingStep} />}

        {view === 'results' && result && (
          <SimulationResults
            result={result}
            onReset={() => {
              setResult(null);
              setView('form');
            }}
            onShare={handleShare}
          />
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-700 pt-4">
          Modelo Dixon-Coles · Poisson Bivariado · 300k simulaciones · Datos vía Claude web search
        </div>
      </div>
    </main>
  );
}
