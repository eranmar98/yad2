import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ItemsServices, { type Item } from '../services/itemsServices';

export default function Browse() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const hasSearch = Boolean(keyword || category);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    ItemsServices.getItems({ keyword: keyword || undefined, category: category || undefined })
      .then(setItems)
      .finally(() => setIsLoading(false));
  }, [keyword, category]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-2 text-center font-display text-3xl font-extrabold text-ink">מודעות</h1>
      {hasSearch && (
        <p className="mb-8 text-center font-sans text-sm text-ink/60">
          {category && (
            <>
              קטגוריה: <span className="font-medium text-navy">{category}</span>
              {keyword ? ' · ' : ''}
            </>
          )}
          {keyword && <>תוצאות חיפוש עבור &quot;{keyword}&quot;</>}
        </p>
      )}

      {isLoading ? (
        <p className="text-center font-sans text-ink/60">טוען...</p>
      ) : items.length === 0 ? (
        <div className="text-center">
          <p className="font-sans text-ink/60">
            {hasSearch ? 'לא מצאנו את מה שחיפשת... נסה מיקום אחר' : 'אין עדיין מודעות פעילות'}
          </p>
          {hasSearch && (
            <Link to="/browse" className="mt-3 inline-block font-sans text-sm text-navy hover:underline">
              נקו את החיפוש וראו את כל המודעות
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item._id} className="overflow-hidden rounded-2xl border border-ink/10">
              {item.images?.[0] ? (
                <img src={item.images[0]} alt={item.title} className="h-48 w-full object-cover" />
              ) : (
                <div className="flex h-48 items-center justify-center bg-navy/5 font-sans text-sm text-ink/40">
                  אין תמונה
                </div>
              )}
              <div className="p-5">
                <span className="font-sans text-xs font-medium text-navy">{item.category}</span>
                <h2 className="mt-1 font-display font-bold text-ink">{item.title}</h2>
                <p className="mt-2 font-display text-lg font-bold text-navy">{item.price} ₪</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}