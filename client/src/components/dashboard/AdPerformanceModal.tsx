import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineXMark, HiOutlineArrowTrendingUp } from 'react-icons/hi2';
import type { Item } from '../../services/itemsServices';
import type { Inquiry } from '../../services/inquiriesServices';
import PillButton from '../PillButton';
import InterestChart, { type ChartPoint } from './InterestChart';

type AdPerformanceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  inquiries: Inquiry[];
  initialItemId?: string | null;
};

function getInquiryItemId(inquiry: Inquiry): string {
  return typeof inquiry.itemId === 'string' ? inquiry.itemId : inquiry.itemId._id;
}

function buildInterestSeries(item: Item, itemInquiries: Inquiry[]): ChartPoint[] {
  const start = new Date(item.createdAt).getTime();
  const now = Date.now();
  const totalDays = Math.max(0, (now - start) / 86_400_000);
  const bucketCount = Math.max(4, Math.min(12, Math.ceil(totalDays) + 1));
  const sortedTimes = itemInquiries
    .map((inq) => new Date(inq.createdAt).getTime())
    .sort((a, b) => a - b);

  const points: ChartPoint[] = [];
  for (let i = 0; i <= bucketCount; i++) {
    const boundary = start + ((now - start) * i) / bucketCount;
    const cumulative = sortedTimes.filter((t) => t <= boundary).length;
    points.push({
      label: new Date(boundary).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }),
      value: cumulative,
    });
  }
  return points;
}

export default function AdPerformanceModal({
  isOpen,
  onClose,
  items,
  inquiries,
  initialItemId,
}: AdPerformanceModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setSelectedId(initialItemId ?? items[0]?._id ?? null);
  }, [isOpen, initialItemId, items]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const inquiriesByItem = useMemo(() => {
    const map = new Map<string, Inquiry[]>();
    inquiries.forEach((inq) => {
      const id = getInquiryItemId(inq);
      const list = map.get(id) ?? [];
      list.push(inq);
      map.set(id, list);
    });
    return map;
  }, [inquiries]);

  if (!isOpen) return null;

  const selectedItem = items.find((it) => it._id === selectedId) ?? null;
  const selectedInquiries = selectedId ? (inquiriesByItem.get(selectedId) ?? []) : [];
  const points = selectedItem ? buildInterestSeries(selectedItem, selectedInquiries) : [];

  const totalForSelected = selectedInquiries.length;
  const totalAcrossAll = inquiries.length;
  const avgPerListing = items.length > 0 ? totalAcrossAll / items.length : 0;
  const deltaPct =
    avgPerListing > 0 ? Math.round(((totalForSelected - avgPerListing) / avgPerListing) * 100) : null;
  const daysLive = selectedItem
    ? Math.max(0, Math.floor((Date.now() - new Date(selectedItem.createdAt).getTime()) / 86_400_000))
    : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ניהול וביצועי מודעות"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-modal-in max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink/10 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-navy to-sky-500 text-white">
              <HiOutlineArrowTrendingUp className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">ניהול מודעות וביצועים</h2>
              <p className="font-sans text-xs text-ink/50">רמת עניין לפי פניות שהתקבלו על כל מודעה</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="rounded-full p-2 text-ink/50 transition-colors duration-150 ease-out hover:bg-ink/5 hover:text-ink"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6 sm:px-8">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="font-sans text-sm text-ink/60">עדיין אין לך מודעות פעילות לניתוח</p>
              <Link to="/publish" onClick={onClose}>
                <PillButton variant="primary">פרסום מודעה ראשונה</PillButton>
              </Link>
            </div>
          ) : (
            <>
              <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
                {items.map((item) => {
                  const count = inquiriesByItem.get(item._id)?.length ?? 0;
                  const isActive = item._id === selectedId;
                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => setSelectedId(item._id)}
                      className={`flex shrink-0 items-center gap-2 rounded-pill border px-3 py-2 transition-colors duration-150 ease-out ${
                        isActive
                          ? 'border-navy bg-navy text-white'
                          : 'border-ink/10 text-ink/70 hover:border-navy/30 hover:bg-navy/5'
                      }`}
                    >
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt="" className="h-6 w-6 rounded-full object-cover" />
                      ) : (
                        <span className="h-6 w-6 rounded-full bg-navy/10" />
                      )}
                      <span className="max-w-[8rem] truncate font-sans text-xs font-bold">{item.title}</span>
                      <span
                        className={`rounded-pill px-1.5 py-0.5 font-sans text-[10px] font-bold tabular-nums ${
                          isActive ? 'bg-white/20 text-white' : 'bg-navy/10 text-navy'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedItem && (
                <>
                  <div className="mb-5 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-ink/10 p-4">
                      <p className="font-sans text-xs text-ink/50">פניות שהתקבלו</p>
                      <p className="mt-1 font-display text-2xl font-extrabold text-ink">
                        {totalForSelected}
                      </p>
                      {deltaPct !== null && (
                        <p
                          className={`mt-1 font-sans text-xs font-bold ${
                            deltaPct >= 0 ? 'text-emerald-600' : 'text-ink/40'
                          }`}
                        >
                          {deltaPct >= 0 ? '+' : ''}
                          {deltaPct}% מהממוצע שלך
                        </p>
                      )}
                    </div>
                    <div className="rounded-2xl border border-ink/10 p-4">
                      <p className="font-sans text-xs text-ink/50">ימים באוויר</p>
                      <p className="mt-1 font-display text-2xl font-extrabold text-ink">{daysLive}</p>
                      <p className="mt-1 font-sans text-xs text-ink/40">מאז הפרסום</p>
                    </div>
                    <div className="rounded-2xl border border-ink/10 p-4">
                      <p className="font-sans text-xs text-ink/50">סטטוס</p>
                      <p className="mt-1 font-display text-2xl font-extrabold text-ink">
                        {selectedItem.status === 'Active' ? 'פעילה' : 'נמכר'}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-pill px-2 py-0.5 font-sans text-[10px] font-bold ${
                          selectedItem.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {selectedItem.status === 'Active' ? 'זמינה לפניות' : 'העסקה הושלמה'}
                      </span>
                    </div>
                  </div>

                  <InterestChart key={selectedItem._id} points={points} />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
