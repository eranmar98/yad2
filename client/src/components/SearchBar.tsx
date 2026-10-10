import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/browse?${new URLSearchParams({ q: trimmed }).toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-8 flex w-full max-w-3xl items-center gap-3 rounded-pill bg-white p-3 shadow-2xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="מה מחפשים היום? רכב, דירה, מוצר..."
        className="min-w-0 flex-1 bg-transparent px-5 py-4 font-sans text-lg text-ink outline-none placeholder:text-ink/40"
      />
      <button
        type="submit"
        className="animate-gradient-flow flex items-center gap-2 rounded-pill bg-gradient-to-r from-navy via-sky-500 to-navy-soft px-8 py-4 font-sans text-lg font-medium text-white"
      >
        <FaSearch size={18} />
        חיפוש
      </button>
    </form>
  );
}