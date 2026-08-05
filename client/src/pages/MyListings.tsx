import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ItemsServices, { type Item } from '../services/itemsServices';

export default function MyListings() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ItemsServices.getMyItems()
      .then(setItems)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold text-ink">המודעות שלי</h1>
        <Link to="/publish" className="font-sans text-sm font-bold text-navy hover:underline">
          + מודעה חדשה
        </Link>
      </div>

      {isLoading ? (
        <p className="text-center font-sans text-ink/60">טוען...</p>
      ) : items.length === 0 ? (
        <p className="text-center font-sans text-ink/60">עוד לא פרסמת מודעות</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item._id} className="overflow-hidden rounded-2xl border border-ink/10">
              {item.images?.[0] ? (
                <img src={item.images[0]} alt={item.title} className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center bg-navy/5 font-sans text-sm text-ink/40">
                  אין תמונה
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <h2 className="font-display font-bold text-ink">{item.title}</h2>
                  <span
                    className={`rounded-pill px-3 py-1 font-sans text-xs font-medium ${
                      item.status === 'Active' ? 'bg-navy/10 text-navy' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {item.status === 'Active' ? 'פעילה' : 'נמכר'}
                  </span>
                </div>
                <p className="mt-2 font-sans text-sm text-ink/60">{item.description}</p>
                <p className="mt-3 font-display text-lg font-bold text-navy">{item.price} ₪</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}