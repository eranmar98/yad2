import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineArrowTrendingUp } from 'react-icons/hi2';
import ItemsServices, { type Item } from '../services/itemsServices';
import InquiriesServices, { type Inquiry } from '../services/inquiriesServices';
import FavoritesServices, { type FavoriteItem } from '../services/favoritesServices';
import useUsersStore from '../store/usersStore';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import AdPerformanceModal from '../components/dashboard/AdPerformanceModal';
import Footer from '../components/Footer';

export default function MyListings() {
  const user = useUsersStore((state) => state.user);
  const [items, setItems] = useState<Item[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsItemId, setAnalyticsItemId] = useState<string | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  useEffect(() => {
    ItemsServices.getMyItems()
      .then(setItems)
      .catch(() => {})
      .finally(() => setIsLoading(false));
    InquiriesServices.getReceivedInquiries()
      .then(setInquiries)
      .catch(() => {});
    FavoritesServices.getMyFavorites()
      .then(setFavorites)
      .catch(() => {});
  }, []);

  const openAnalytics = (itemId: string | null) => {
    setAnalyticsItemId(itemId ?? items[0]?._id ?? null);
    setIsAnalyticsOpen(true);
  };
  const closeAnalytics = () => setIsAnalyticsOpen(false);

  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <DashboardSidebar
        user={user}
        listingsCount={items.length}
        messagesCount={inquiries.length}
        favoritesCount={favorites.length}
        onOpenAdManagement={() => openAnalytics(null)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <section className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
          <h1 className="mb-8 font-display text-3xl font-extrabold text-ink">המודעות שלי</h1>

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
                    <div className="mt-3 flex items-center justify-between">
                      <p className="font-display text-lg font-bold text-navy">{item.price} ₪</p>
                      <button
                        type="button"
                        onClick={() => openAnalytics(item._id)}
                        className="flex items-center gap-1.5 rounded-pill border border-navy/15 px-3 py-1.5 font-sans text-xs font-bold text-navy transition-colors duration-150 ease-out hover:bg-navy/5 active:scale-95"
                      >
                        <HiOutlineArrowTrendingUp className="h-3.5 w-3.5" />
                        ביצועים
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            to="/inquiries"
            className="mt-8 block text-center font-sans text-sm text-navy hover:underline"
          >
            כל הפניות שקיבלת
          </Link>
        </section>

        <Footer />
      </div>

      <AdPerformanceModal
        isOpen={isAnalyticsOpen}
        onClose={closeAnalytics}
        items={items}
        inquiries={inquiries}
        initialItemId={analyticsItemId}
      />
    </div>
  );
}
