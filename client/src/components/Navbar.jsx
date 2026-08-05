import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import { navLinks } from '../siteContent';
import ToggleMark from '../ToggleMark';
import PillButton from './PillButton';
import useUsersStore from '../store/usersStore';

const subCategories = ['נדל"ן', 'רכבים', 'מוצרים'];

const focusRing =
  'outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2';
const navLinkBase = `font-sans text-base font-bold transition-colors duration-150 ease-out ${focusRing}`;

export default function Navbar() {
  const navigate = useNavigate();
  const user = useUsersStore((state) => state.user);
  const token = useUsersStore((state) => state.token);
  const logout = useUsersStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="w-full border-b border-ink/10">
      <nav className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4">
        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) =>
            link.label === 'קטגוריות' ? (
              <li key={link.href} className="group relative">
                <button
                  type="button"
                  className={`${navLinkBase} inline-flex items-center gap-1 text-ink/70 hover:text-navy`}
                >
                  {link.label}
                  <FaChevronDown className="h-3 w-3 transition-transform duration-150 ease-out group-hover:rotate-180" />
                </button>

                <div className="invisible absolute top-full right-0 z-10 mt-2 w-44 rounded-2xl border border-navy/10 bg-white p-2 opacity-0 shadow-xl transition-[opacity,visibility] duration-150 ease-out group-hover:visible group-hover:opacity-100">
                  {subCategories.map((sub) => (
                    <a
                      key={sub}
                      href="#"
                      className="block rounded-lg px-3 py-2 font-sans text-sm text-ink/80 transition-colors duration-150 ease-out hover:bg-navy/5 hover:text-navy"
                    >
                      {sub}
                    </a>
                  ))}
                </div>
              </li>
            ) : (
              <li key={link.href}>
                {link.href.startsWith('/') ? (
                  <NavLink
                    to={link.href}
                    end={link.href === '/'}
                    className={({ isActive }) =>
                      `${navLinkBase} ${isActive ? 'text-navy' : 'text-ink/70 hover:text-navy'}`
                    }
                  >
                    {link.label}
                  </NavLink>
                ) : (
                  <a href={link.href} className={`${navLinkBase} text-ink/70 hover:text-navy`}>
                    {link.label}
                  </a>
                )}
              </li>
            )
          )}
        </ul>

        <div className="flex items-center justify-self-center gap-2">
          <ToggleMark />
          <Link to="/" className={`font-display text-lg font-extrabold text-ink ${focusRing}`}>
            לוח מודעות
          </Link>
        </div>

        <div className="flex items-center justify-self-end gap-4">
          {token ? (
            <div className="hidden items-center gap-3 md:flex">
              <Link
                to="/my-listings"
                className={`font-sans text-sm font-bold text-ink/70 transition-colors duration-150 ease-out hover:text-navy ${focusRing}`}
              >
                הפרופיל שלי · מחובר{user?.firstName ? ` (${user.firstName})` : ''}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={`font-sans text-xs text-ink/50 transition-colors duration-150 ease-out hover:text-navy ${focusRing}`}
              >
                התנתקות
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={`hidden font-sans text-sm font-bold text-ink/70 transition-colors duration-150 ease-out hover:text-navy md:inline ${focusRing}`}
            >
              התחברות
            </Link>
          )}
          <PillButton variant="secondary" onClick={() => navigate('/publish')}>
            פרסם מודעה
          </PillButton>
        </div>
      </nav>
    </header>
  );
}