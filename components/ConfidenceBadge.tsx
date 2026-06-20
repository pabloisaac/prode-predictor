interface Props {
  level: 'ALTA' | 'MEDIA' | 'BAJA';
  reason?: string;
}

const CONFIG = {
  ALTA: { label: 'Confianza ALTA', color: 'text-[#00E676] border-[#00E676]/40 bg-[#00E676]/10' },
  MEDIA: { label: 'Confianza MEDIA', color: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10' },
  BAJA: { label: 'Confianza BAJA', color: 'text-red-400 border-red-400/40 bg-red-400/10' },
};

export default function ConfidenceBadge({ level, reason }: Props) {
  const cfg = CONFIG[level];
  return (
    <div className={`inline-flex flex-col gap-1 border rounded-lg px-4 py-2 ${cfg.color}`}>
      <span className="text-xs font-bold uppercase tracking-widest">{cfg.label}</span>
      {reason && <span className="text-xs opacity-80">{reason}</span>}
    </div>
  );
}
