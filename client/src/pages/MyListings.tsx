import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HiOutlineArrowTrendingUp } from 'react-icons/hi2';
import ItemsServices, { type Item } from '../services/itemsServices';
import InquiriesServices, { type Inquiry } from '../services/inquiriesServices';
import FavoritesServices, { type FavoriteItem } from '../services/favoritesServices';
import useUsersStore from '../store/usersStore';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import AdPerformanceModal from '../components/dashboard/AdPerformanceModal';
import Messenger from '../components/dashboard/chat/Messenger';
import Footer from '../components/Footer';
import useConversations from '../hooks/useConversations';

export default function MyListings() {
  const user = useUsersStore((state) => state.user);
  const [items, setItems] = useState<Item[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsItemId, setAnalyticsItemId] = useState<string | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // ?view=messages switches the main panel to the messenger; &c=<id> opens a conversation.
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') === 'messages' ? 'messages' : 'listings';
  const selectedConversationId = searchParams.get('c');
  // Poll fast while the messenger is open, slowly otherwise (just for the unread badge).
  const chat = useConversations(view === 'messages' ? 4000 : 15000);

  const selectConversation = (conversationId: string | null) => {
    setSearchParams(conversationId ? { view: 'messages', c: conversationId } : { view: 'messages' });
  };

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
        messagesCount={chat.conversations.length}
        unreadCount={chat.unreadTotal}
        activeView={view}
        favoritesCount={favorites.length}
        onOpenAdManagement={() => openAnalytics(null)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {view === 'messages' ? (
          <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
            <div className="mb-6 flex items-baseline gap-3">
              <h1 className="font-display text-3xl font-extrabold text-ink">ההודעות שלי</h1>
              {chat.unreadTotal > 0 && (
                <span className="rounded-pill bg-navy px-2.5 py-0.5 font-sans text-xs font-bold tabular-nums text-white">
                  {chat.unreadTotal} חדשות
                </span>
              )}
            </div>
            <Messenger
              conversations={chat.conversations}
              isLoading={chat.isLoading}
              selectedId={selectedConversationId}
              onSelect={selectConversation}
              onRead={chat.markRead}
              onMessageSent={chat.applySentMessage}
            />
          </section>
        ) : (
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
              to="/my-listings?view=messages"
              className="mt-8 block text-center font-sans text-sm text-navy hover:underline"
            >
              לכל השיחות שלי
            </Link>
          </section>
        )}

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
