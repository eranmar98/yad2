import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FavoritesServices, { type FavoriteItem } from '../services/favoritesServices';

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    FavoritesServices.getMyFavorites()
      .then(setFavorites)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold text-ink">המועדפים שלי</h1>
        <Link to="/my-listings" className="font-sans text-sm font-bold text-navy hover:underline">
          חזרה לפרופיל
        </Link>
      </div>

      {isLoading ? (
        <p className="text-center font-sans text-ink/60">טוען...</p>
      ) : favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 py-16 text-center">
          <p className="font-sans text-ink/60">עוד לא הוספת מודעות למועדפים</p>
          <Link to="/browse" className="mt-3 inline-block font-sans text-sm font-bold text-navy hover:underline">
            גלו מודעות
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {favorites.map((favorite) => {
            const item = typeof favorite.itemId === 'string' ? null : favorite.itemId;
            if (!item) return null;
            return (
              <Link
                key={favorite._id}
                to={`/browse?category=${encodeURIComponent(item.category)}`}
                className="overflow-hidden rounded-2xl border border-ink/10 transition-shadow duration-150 ease-out hover:shadow-md"
              >
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-navy/5 font-sans text-sm text-ink/40">
                    אין תמונה
                  </div>
                )}
                <div className="p-5">
                  <h2 className="font-display font-bold text-ink">{item.title}</h2>
                  <p className="mt-3 font-display text-lg font-bold text-navy">{item.price} ₪</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
