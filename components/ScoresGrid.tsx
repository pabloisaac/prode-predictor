interface Props {
  topScores: Array<{ score: string; prob: number }>;
  homeTeam: string;
  awayTeam: string;
}

export default function ScoresGrid({ topScores, homeTeam, awayTeam }: Props) {
  const maxProb = topScores[0]?.prob ?? 1;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 text-xs text-gray-500 uppercase tracking-widest pb-1 border-b border-[#222]">
        <span>{homeTeam.slice(0, 10).toUpperCase()}</span>
        <span className="text-center">Marcador</span>
        <span className="text-right">{awayTeam.slice(0, 10).toUpperCase()}</span>
      </div>
      {topScores.map(({ score, prob }, idx) => {
        const [h, a] = score.split('-');
        const pct = (prob * 100).toFixed(1);
        const width = (prob / maxProb) * 100;
        return (
          <div key={score} className="relative">
            <div
              className="absolute inset-0 rounded opacity-10"
              style={{
                width: `${width}%`,
                backgroundColor: idx === 0 ? '#00E676' : '#333',
              }}
            />
            <div className="relative flex items-center justify-between px-2 py-1.5">
              <span className="text-lg font-black text-white w-8 text-center">{h}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">─</span>
                <span
                  className={`text-xs font-bold ${idx === 0 ? 'text-[#00E676]' : 'text-gray-400'}`}
                >
                  {pct}%
                </span>
                <span className="text-gray-500 text-xs">─</span>
              </div>
              <span className="text-lg font-black text-white w-8 text-center">{a}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
