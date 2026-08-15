import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { SiGooglegemini } from 'react-icons/si';
import { getAiClient } from '../api/ai';
import { flattenCategoryPaths } from '../data/categories';

type ParsedSearch = {
  category: string | null;
  keyword: string | null;
};

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const parseSearch = async (text: string): Promise<ParsedSearch> => {
    const options = flattenCategoryPaths();
    const prompt = `להלן רשימת קטגוריות קיימות באתר מודעות:\n${options.map((o) => `- ${o}`).join('\n')}\n\nהמשתמש חיפש: "${text}"\n\nהחזירו JSON בלבד, בלי טקסט נוסף, בפורמט:\n{"category": "השם המדויק מהרשימה שהכי מתאים, או null אם אין התאמה", "keyword": "מילות חיפוש חופשיות שלא קשורות לקטגוריה עצמה (כמו מיקום), או null אם אין"}\n\nלדוגמה, עבור "בית להשכרה ברעננה": {"category": "נדל\\"ן / להשכרה / בית/קוטג׳", "keyword": "רעננה"}`;

    try {
      const ai = getAiClient();
      const result = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });
      const raw = result.text?.trim().replace(/^```json\s*|\s*```$/g, '') ?? '{}';
      const parsed = JSON.parse(raw);
      const category = options.includes(parsed.category) ? parsed.category : null;
      const keyword =
        typeof parsed.keyword === 'string' && parsed.keyword.trim() ? parsed.keyword.trim() : null;
      return { category, keyword };
    } catch (error) {
      console.error('AI search parsing failed:', error);
      return { category: null, keyword: text };
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSearching(true);
    const { category, keyword } = await parseSearch(trimmed);
    setIsSearching(false);

    const params = new URLSearchParams();
    if (category) params.set('category', category);
    // Only fall back to the raw query text when nothing matched a category —
    // otherwise it re-filters an already-matched category by its own name and finds nothing.
    if (keyword) {
      params.set('q', keyword);
    } else if (!category) {
      params.set('q', trimmed);
    }
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-8 flex w-full max-w-2xl items-center gap-2 rounded-pill bg-white p-2 shadow-2xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="מה מחפשים היום? רכב, דירה, מוצר..."
        className="min-w-0 flex-1 bg-transparent px-4 py-3 font-sans text-ink outline-none placeholder:text-ink/40"
      />
      <button
        type="submit"
        disabled={isSearching}
        className="animate-gradient-flow flex items-center gap-2 rounded-pill bg-gradient-to-r from-navy via-sky-500 to-navy-soft px-6 py-3 font-sans font-medium text-white disabled:opacity-70"
      >
        {isSearching ? <SiGooglegemini size={14} className="animate-spin" /> : <FaSearch size={14} />}
        {isSearching ? 'מחפשת...' : 'חיפוש'}
      </button>
    </form>
  );
}