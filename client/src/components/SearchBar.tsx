import { FaSearch } from 'react-icons/fa';

export default function SearchBar() {
  return (
    <form className="mx-auto mt-8 flex w-full max-w-2xl items-center gap-2 rounded-pill bg-white p-2 shadow-2xl">
      <input
        type="text"
        placeholder="מה מחפשים היום? רכב, דירה, מוצר..."
        className="min-w-0 flex-1 bg-transparent px-4 py-3 font-sans text-ink outline-none placeholder:text-ink/40"
      />
      <button
        type="submit"
        className="animate-gradient-flow flex items-center gap-2 rounded-pill bg-gradient-to-r from-navy via-sky-500 to-navy-soft px-6 py-3 font-sans font-medium text-white"
      >
        <FaSearch size={14} />
        חיפוש
      </button>
    </form>
  );
}