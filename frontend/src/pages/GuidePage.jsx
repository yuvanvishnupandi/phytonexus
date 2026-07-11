import { Droplets, Scissors, ShieldCheck, SunMedium } from "lucide-react";

const cards = [
  ["Water check", "Touch the top 2 cm of soil before watering. Most stressed plants recover faster with consistent moisture, not flooding.", Droplets],
  ["Light reset", "Move weak plants into bright indirect light for several days unless the species is known to need full sun.", SunMedium],
  ["Remove damage", "Trim leaves that are fully brown, mushy, or heavily infected so the plant can redirect energy to new growth.", Scissors],
  ["Isolation", "If pests or fungal spots appear, isolate the plant and clean nearby tools before treating.", ShieldCheck]
];

export default function GuidePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-clay">Care Guide</p>
        <h1 className="mt-1 text-3xl font-semibold">Practical recovery playbook</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          The AI report gives plant-specific advice. This page gives the general recovery principles that make the demo feel complete and useful.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {cards.map(([title, body, Icon]) => (
          <article key={title} className="rounded-lg border border-line bg-panel p-5 shadow-sm">
            <Icon size={24} className="mb-4 text-sage" />
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-line bg-panel p-5 shadow-sm">
        <h2 className="text-lg font-semibold">How to use the prediction</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["Use ranges, not exact dates", "Recheck after 7 days", "Compare with new growth"].map((item) => (
            <div key={item} className="rounded-lg bg-surface p-4 text-sm text-muted">{item}</div>
          ))}
        </div>
      </section>
    </div>
  );
}

