import { stats } from '../siteContent';

export default function StatsBar() {
  return (
    <section className="bg-lime py-2">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-1 px-6">
        {stats.map((stat) => (
          <div key={stat.id} className="font-sans text-xs uppercase tracking-wide text-ink">
            {stat.lines.map((line, i) => (
              <span key={i} className={i === 0 ? 'font-semibold' : 'text-ink/70'}>
                {line}
                {i < stat.lines.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}