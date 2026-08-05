import { useNavigate } from 'react-router-dom';
import PillButton from './PillButton';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="animate-fade-in-up mx-auto max-w-6xl px-6 py-16 text-center md:py-24">
      <h1 className="font-display text-4xl font-extrabold leading-tight text-ink md:text-6xl">
        קונים ומוכרים פריטים משומשים,
        <br />
        <span className="bg-ink px-2 text-lime">בלי כאב ראש</span>
      </h1>

      <p className="mx-auto mt-6 max-w-xl font-sans text-lg text-ink/80">
        מפרסמים מודעה בשניות, ובינה מלאכותית עוזרת לבחור קטגוריה ומחיר הוגן.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <PillButton variant="primary">פרסמו מודעה בחינם</PillButton>
        <PillButton variant="secondary" onClick={() => navigate('/browse')}>
          גלו מודעות
        </PillButton>
      </div>
    </section>
  );
}