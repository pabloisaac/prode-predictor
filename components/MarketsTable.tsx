import { SimulationResult } from '@/types/simulation';

interface Props {
  sim: SimulationResult;
  homeTeam: string;
  awayTeam: string;
}

function Row({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <tr className={`border-b border-[#1a1a1a] ${highlight ? 'bg-[#00E676]/5' : ''}`}>
      <td className="py-2.5 px-3 text-sm text-gray-300">{label}</td>
      <td className="py-2.5 px-3 text-right font-bold text-sm" style={{ color: value > 0.55 ? '#00E676' : value < 0.45 ? '#ef4444' : '#e5e7eb' }}>
        {(value * 100).toFixed(1)}%
      </td>
    </tr>
  );
}

export default function MarketsTable({ sim, homeTeam, awayTeam }: Props) {
  return (
    <div className="space-y-4">
      {/* Goals markets */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Mercados de goles</h4>
        <table className="w-full">
          <tbody>
            <Row label="Más de 1.5 goles" value={sim.over15} />
            <Row label="Menos de 1.5 goles" value={sim.under15} />
            <Row label="Más de 2.5 goles" value={sim.over25} highlight />
            <Row label="Menos de 2.5 goles" value={sim.under25} highlight />
            <Row label="Más de 3.5 goles" value={sim.over35} />
            <Row label="Menos de 3.5 goles" value={sim.under35} />
          </tbody>
        </table>
      </div>

      {/* Special markets */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Mercados especiales</h4>
        <table className="w-full">
          <tbody>
            <Row label="Ambos anotan (BTTS Sí)" value={sim.btts} />
            <Row label="Ambos anotan (BTTS No)" value={1 - sim.btts} />
            <Row label={`Valla invicta ${homeTeam}`} value={sim.cleanSheetHome} />
            <Row label={`Valla invicta ${awayTeam}`} value={sim.cleanSheetAway} />
          </tbody>
        </table>
      </div>

      {/* xG */}
      <div className="flex gap-4 pt-2 border-t border-[#222]">
        <div className="flex-1 text-center">
          <div className="text-2xl font-black text-[#00E676]">{sim.expectedGoalsHome.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">xG {homeTeam}</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-2xl font-black text-[#4FC3F7]">{sim.expectedGoalsAway.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">xG {awayTeam}</div>
        </div>
      </div>
    </div>
  );
}
