import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaFacebookF, FaInstagram, FaWhatsapp, FaLinkedinIn } from 'react-icons/fa';
import ItemsServices from '../services/itemsServices';
import logo from '../assets/logo.svg';

const socialLinks = [
  { icon: FaFacebookF, label: 'פייסבוק', href: '#' },
  { icon: FaInstagram, label: 'אינסטגרם', href: '#' },
  { icon: FaWhatsapp, label: 'וואטסאפ', href: '#' },
  { icon: FaLinkedinIn, label: 'לינקדאין', href: '#' },
];

export default function Footer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    ItemsServices.getItems()
      .then((items) => setActiveCount(items.length))
      .catch(() => setActiveCount(null));
  }, []);

  useEffect(() => {
    if (isOpen) {
      footerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [isOpen]);

  return (
    <footer id="contact" ref={footerRef} className="border-t border-ink/10 bg-white">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-center gap-2 py-4 font-sans text-sm font-medium text-ink/60 outline-none transition-colors duration-150 ease-out hover:text-navy focus-visible:text-navy"
      >
        {isOpen ? 'סגירה' : 'פרטי יצירת קשר ועוד'}
        <FaChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-12 pt-2 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <img src={logo} alt="לוח מודעות" className="h-9 w-auto" />
              <p className="mt-4 font-sans text-sm text-ink/60">
                {activeCount !== null
                  ? `${activeCount}+ מודעות פעילות באתר כרגע`
                  : 'השוק החדש של ישראל — קונים ומוכרים בלי כאב ראש'}
              </p>
            </div>

            <div>
              <h3 className="font-display text-sm font-bold text-ink">ניווט מהיר</h3>
              <ul className="mt-4 flex flex-col gap-2 font-sans text-sm text-ink/60">
                <li>
                  <Link to="/publish" className="transition-colors duration-150 ease-out hover:text-navy">
                    פרסם מודעה
                  </Link>
                </li>
                <li>
                  <Link to="/browse" className="transition-colors duration-150 ease-out hover:text-navy">
                    מודעות
                  </Link>
                </li>
                <li>
                  <a href="#about" className="transition-colors duration-150 ease-out hover:text-navy">
                    אודות
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-sm font-bold text-ink">צור קשר</h3>
              <ul className="mt-4 flex flex-col gap-2 font-sans text-sm text-ink/60">
                <li>support@pickit.co.il</li>
                <li dir="ltr" className="text-right">
                  03-1234567
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-sm font-bold text-ink">עקבו אחרינו</h3>
              <div className="mt-4 flex gap-3">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/5 text-navy transition-[background-color,color,transform] duration-150 ease-out hover:-translate-y-1 hover:bg-navy hover:text-white"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-ink/10 py-4 text-center font-sans text-xs text-ink/40">
            © {new Date().getFullYear()} לוח מודעות. כל הזכויות שמורות.
          </div>
        </div>
      </div>
    </footer>
  );
}
