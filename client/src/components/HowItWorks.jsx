import { FaUserPlus, FaBoxOpen, FaCommentDots, FaArrowLeft } from 'react-icons/fa';

const steps = [
  {
    icon: FaUserPlus,
    title: 'נרשמים',
    description: 'יוצרים חשבון תוך שניות ומתחילים להשתמש בפלטפורמה',
    accent: '#152A4E', // navy
  },
  {
    icon: FaBoxOpen,
    title: 'בוחרים מה לפרסם',
    description: 'מעלים תמונה, כותבים תיאור קצר ובוחרים קטגוריה',
    accent: '#0ea5e9', // sky-500
  },
  {
    icon: FaCommentDots,
    title: 'מקבלים הודעה ישירות מהמתעניין',
    description: 'המתעניינים כותבים לכם ישירות, בלי מתווכים ובלי עמלות',
    accent: '#93AC80', // sage
  },
];

function StepCard({ step, index }) {
  const Icon = step.icon;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="group relative overflow-hidden rounded-3xl border border-ink/10 bg-white p-8 text-center shadow-lg shadow-navy/5 transition-transform duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-navy/10"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-3 left-4 font-display text-7xl font-extrabold text-ink/[0.04] transition-colors duration-300 group-hover:text-ink/[0.06]"
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(260px circle at var(--x, 50%) var(--y, 50%), ${step.accent}26, transparent 70%)`,
        }}
      />

      <span
        className="relative z-10 mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-md transition-transform duration-300 ease-out group-hover:scale-110"
        style={{ backgroundColor: step.accent }}
      >
        <Icon size={22} />
      </span>

      <h3 className="relative z-10 font-display text-lg font-bold text-ink">{step.title}</h3>
      <p className="relative z-10 mt-2 font-sans text-sm leading-relaxed text-ink/60">
        {step.description}
      </p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-white px-6 py-20 md:py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-300/20 blur-3xl" />

      <h2 className="mx-auto max-w-xl text-center font-display text-3xl font-extrabold text-ink md:text-4xl">
        איך זה עובד?
      </h2>
      <p className="mx-auto mt-3 max-w-md text-center font-sans text-ink/60">
        שלושה צעדים פשוטים, מהרשמה ועד עסקה
      </p>

      <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-4">
        {steps.map((step, index) => (
          <div key={step.title} className="contents">
            <StepCard step={step} index={index} />
            {index < steps.length - 1 && (
              <div className="hidden items-center justify-center text-ink/20 md:flex">
                <FaArrowLeft size={18} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
