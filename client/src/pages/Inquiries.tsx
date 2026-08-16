import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import InquiriesServices, { type Inquiry } from '../services/inquiriesServices';
import type { Item } from '../services/itemsServices';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function Inquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    InquiriesServices.getReceivedInquiries()
      .then(setInquiries)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 font-display text-3xl font-extrabold text-ink">פניות שקיבלתי</h1>

      {isLoading ? (
        <p className="text-center font-sans text-ink/60">טוען...</p>
      ) : inquiries.length === 0 ? (
        <p className="text-center font-sans text-ink/60">עוד לא התקבלו פניות על המודעות שלך</p>
      ) : (
        <div className="flex flex-col gap-4">
          {inquiries.map((inquiry) => {
            const item = typeof inquiry.itemId === 'string' ? null : (inquiry.itemId as Pick<Item, '_id' | 'title' | 'price' | 'images'>);
            const buyer = typeof inquiry.userId === 'string' ? null : inquiry.userId;

            return (
              <div key={inquiry._id} className="rounded-2xl border border-ink/10 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-sans text-xs text-ink/50">{formatDate(inquiry.createdAt)}</p>
                    <h2 className="mt-1 font-display font-bold text-ink">
                      {item ? item.title : 'מודעה'}
                    </h2>
                    {buyer && (
                      <p className="mt-1 font-sans text-sm text-ink/70">
                        מאת: {buyer.firstName} {buyer.lastName} · {buyer.phone} · {buyer.email}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-pill bg-navy/10 px-3 py-1 font-sans text-xs font-medium text-navy">
                    {inquiry.status === 'Pending'
                      ? 'ממתין'
                      : inquiry.status === 'Answered'
                        ? 'נענה'
                        : 'סגור'}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap font-sans text-sm text-ink/80">{inquiry.message}</p>
              </div>
            );
          })}
        </div>
      )}

      <Link
        to="/my-listings"
        className="mt-8 block text-center font-sans text-sm text-navy hover:underline"
      >
        חזרה למודעות שלי
      </Link>
    </section>
  );
}
