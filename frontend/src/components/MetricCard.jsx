export function FormatText({ text }) {
  if (!text) return null;
  let formattedText = text.charAt(0).toUpperCase() + text.slice(1);
  const parts = formattedText.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i} className="font-medium italic">{part.slice(1, -1)}</em>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function MetricCard({ label, value, tone = "default" }) {
  const toneClass = {
    default: "bg-surface border-line bg-gradient-to-br from-surface to-black/[0.02]",
    green: "bg-sage/10 border-sage/20 text-sage bg-gradient-to-br from-sage/10 to-sage/5",
    clay: "bg-clay/10 border-clay/20 text-clay bg-gradient-to-br from-clay/10 to-clay/5",
    blue: "bg-blue-50 border-blue-200 text-blue-800 bg-gradient-to-br from-blue-50 to-white",
    critical: "bg-red-50 border-red-200 text-red-800 bg-gradient-to-br from-red-50 to-white",
    warning: "bg-orange-50 border-orange-200 text-orange-800 bg-gradient-to-br from-orange-50 to-white"
  }[tone];

  return (
    <div className={`rounded-xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative overflow-hidden ${toneClass}`}>
      <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/20 blur-xl"></div>
      <p className="text-[0.65rem] uppercase tracking-widest font-bold opacity-70 mb-2 relative z-10">{label}</p>
      <p className="text-lg leading-snug text-ink relative z-10 font-bold">
        <FormatText text={value} />
      </p>
    </div>
  );
}
