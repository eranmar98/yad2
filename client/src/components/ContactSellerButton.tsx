import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
import InquiriesServices from '../services/inquiriesServices';
import useUsersStore from '../store/usersStore';
import PillButton from './PillButton';
import type { Item } from '../services/itemsServices';

type ContactSellerButtonProps = {
  item: Item;
  className?: string;
};

export default function ContactSellerButton({ item, className = '' }: ContactSellerButtonProps) {
  const navigate = useNavigate();
  const token = useUsersStore((state) => state.token);
  const user = useUsersStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const isOwnItem = Boolean(user && item.sellerId === user._id);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (isOwnItem) return null;

  const openModal = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setError('');
    setMessage('');
    setIsSent(false);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('יש לכתוב הודעה למוכר');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await InquiriesServices.createInquiry(item._id, message.trim());
      setIsSent(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const serverMessage = err.response?.data?.error;
        setError(serverMessage ?? 'שליחת ההודעה נכשלה, נסו שוב');
      } else {
        setError('שליחת ההודעה נכשלה, נסו שוב');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PillButton variant="secondary" className={className} onClick={openModal}>
        צור קשר עם המוכר
      </PillButton>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">צור קשר עם המוכר</h2>
                <p className="mt-1 font-sans text-sm text-ink/60">בנוגע ל: {item.title}</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="סגירה"
                className="rounded-full p-1 text-ink/50 transition-colors duration-150 ease-out hover:bg-ink/5 hover:text-ink"
              >
                <FaTimes />
              </button>
            </div>

            {isSent ? (
              <div className="text-center">
                <p className="font-sans text-ink">ההודעה נשלחה בהצלחה!</p>
                <p className="mt-1 font-sans text-sm text-ink/60">המוכר יקבל את פנייתך ויוכל לחזור אליך.</p>
                <PillButton variant="primary" className="mt-5 w-full" onClick={closeModal}>
                  סגירה
                </PillButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1 text-right">
                  <span className="font-sans text-sm text-ink/70">ההודעה שלך</span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="שלום, אני מתעניין/ת בפריט..."
                    rows={4}
                    className="w-full rounded-xl border border-ink/15 px-4 py-3 font-sans text-ink outline-none focus:border-navy"
                  />
                </label>

                {error && <p className="font-sans text-sm text-red-600">{error}</p>}

                <PillButton type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'שולחת...' : 'שליחת הודעה'}
                </PillButton>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
