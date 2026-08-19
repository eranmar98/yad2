import { useEffect, useRef, useState } from 'react';
import ItemsServices, { type Item } from '../services/itemsServices';

export default function HotListings() {
  const [items, setItems] = useState<Item[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const [isPointerDown, setIsPointerDown] = useState(false);

  useEffect(() => {
    ItemsServices.getItems()
      .then((data) => setItems(data.slice(0, 14)))
      .catch(() => setItems([]));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    setIsPointerDown(true);
    startX.current = e.clientX;
    startScrollLeft.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!isDragging.current || !el) return;
    const delta = e.clientX - startX.current;
    el.scrollLeft = startScrollLeft.current - delta;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    setIsPointerDown(false);
    scrollRef.current?.releasePointerCapture(e.pointerId);
  };

  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="pointer-events-none absolute -top-16 -right-10 h-80 w-80 rounded-full bg-brand-purple-soft/25 blur-3xl animate-drift" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-96 w-96 rounded-full bg-brand-purple/15 blur-3xl animate-drift-reverse" />

      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <h2 className="font-display text-3xl font-extrabold text-ink md:text-4xl">
          <span className="text-brand-purple">מודעות</span> חמות
        </h2>
        <p className="mx-auto mt-3 max-w-md font-sans text-ink/60">
          גררו עם העכבר ימינה ושמאלה לעוד מודעות
        </p>
      </div>

      <div
        ref={scrollRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className={`no-scrollbar relative mt-12 grid grid-flow-col grid-rows-2 gap-6 overflow-x-auto scroll-smooth px-6 pb-2 md:px-16 ${
          isPointerDown ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
        style={{ gridAutoColumns: 'min(300px, 78vw)' }}
      >
        {items.map((item) => (
          <div
            key={item._id}
            className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-lg shadow-navy/5"
          >
            {item.images?.[0] ? (
              <img
                src={item.images[0]}
                alt={item.title}
                draggable={false}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="flex h-48 items-center justify-center bg-navy/5 font-sans text-sm text-ink/40">
                אין תמונה
              </div>
            )}
            <div className="p-5">
              <span className="font-sans text-xs font-medium text-brand-purple">
                {item.category}
              </span>
              <h3 className="mt-1 truncate font-display text-lg font-bold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 font-display text-xl font-bold text-navy">{item.price} ₪</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
