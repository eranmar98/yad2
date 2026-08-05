import SearchBar from './SearchBar';
import CategoryCards from './CategoryCards';

export default function Hero() {
  return (
    <section className="animate-fade-in-up relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white px-6 pb-16 pt-8 text-center md:pb-20 md:pt-10">
      <div className="pointer-events-none absolute -top-32 -right-20 -z-10 h-96 w-96 rounded-full bg-navy/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 -z-10 h-96 w-96 rounded-full bg-sky-300/30 blur-3xl" />

      <h1 className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-tight text-ink md:text-6xl">
        קונים ומוכרים <span className="text-navy">פריטים משומשים</span>,
        <br />
        בלי כאב ראש
      </h1>

      <p className="mx-auto mt-6 max-w-xl font-sans text-lg text-ink/60">
        מפרסמים מודעה בשניות, ובינה מלאכותית עוזרת לבחור קטגוריה ומחיר הוגן
      </p>

      <SearchBar />

      <CategoryCards />
    </section>
  );
}