import { FaHome, FaCar, FaShoppingBag } from 'react-icons/fa';

const categories = [
  {
    icon: FaHome,
    label: 'נדל"ן',
    description: 'דירות, בתים ומגרשים',
    gradient: 'from-navy to-navy-soft',
  },
  {
    icon: FaCar,
    label: 'רכבים',
    description: 'רכבים, אופנועים ועוד',
    gradient: 'from-blue-600 to-sky-500',
  },
  {
    icon: FaShoppingBag,
    label: 'מוצרים',
    description: 'ריהוט, אלקטרוניקה ועוד',
    gradient: 'from-sky-500 to-cyan-400',
  },
];

export default function CategoryCards() {
  return (
    <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-3">
      {categories.map(({ icon: Icon, label, description, gradient }) => (
        <div
          key={label}
          className={`group relative flex cursor-pointer flex-col items-center gap-3 overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-8 text-center shadow-xl shadow-navy/20 transition-transform duration-200 ease-out hover:-translate-y-2`}
        >
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-opacity duration-200 group-hover:opacity-70" />

          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm transition-transform duration-200 ease-out group-hover:scale-110">
            <Icon size={28} />
          </span>
          <span className="font-display text-xl font-bold text-white">{label}</span>
          <span className="font-sans text-sm text-white/80">{description}</span>
        </div>
      ))}
    </div>
  );
}