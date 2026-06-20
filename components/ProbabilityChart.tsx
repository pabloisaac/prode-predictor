'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Props {
  homeWin: number;
  draw: number;
  awayWin: number;
  homeTeam: string;
  awayTeam: string;
}

export default function ProbabilityChart({ homeWin, draw, awayWin, homeTeam, awayTeam }: Props) {
  const data = [
    { name: homeTeam, value: homeWin * 100, color: '#00E676' },
    { name: 'Empate', value: draw * 100, color: '#888' },
    { name: awayTeam, value: awayWin * 100, color: '#4FC3F7' },
  ];

  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.name} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300 font-medium truncate max-w-[60%] uppercase">{d.name}</span>
            <span className="font-bold" style={{ color: d.color }}>
              {d.value.toFixed(1)}%
            </span>
          </div>
          <div className="h-2.5 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${d.value}%`, backgroundColor: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
