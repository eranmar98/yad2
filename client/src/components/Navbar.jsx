import { Link, NavLink, useNavigate } from 'react-router-dom';
import { navLinks } from '../siteContent';
import ToggleMark from '../ToggleMark';
import PillButton from './PillButton';
import useUsersStore from '../store/usersStore';

const focusRing =
  'outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2';
const navLinkBase = `font-sans text-xs uppercase tracking-wide transition-colors duration-150 ease-out ${focusRing}`;

export default function Navbar() {
  const navigate = useNavigate();
  const user = useUsersStore((state) => state.user);
  const logout = useUsersStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="w-full border-b border-ink/10">
      <nav className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4">
        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              {link.href.startsWith('/') ? (
                <NavLink
                  to={link.href}
                  end={link.href === '/'}
                  className={({ isActive }) =>
                    `${navLinkBase} ${isActive ? 'font-semibold text-ink' : 'text-ink/60 hover:text-ink'}`
                  }
                >
                  {link.label}
                </NavLink>
              ) : (
                <a href={link.href} className={`${navLinkBase} text-ink/60 hover:text-ink`}>
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        <Link
          to="/"
          className={`group flex items-center justify-self-center gap-2 ${focusRing}`}
        >
          <ToggleMark />
          <span className="font-display text-lg font-extrabold text-ink">לוח מודעות</span>
        </Link>

        <div className="flex items-center justify-self-end gap-4">
          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              <span className="font-sans text-xs text-ink/70">שלום, {user.firstName}</span>
              <button
                type="button"
                onClick={handleLogout}
                className={`font-sans text-xs uppercase tracking-wide text-ink/70 transition-colors duration-150 ease-out hover:text-ink ${focusRing}`}
              >
                התנתקות
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={`hidden font-sans text-xs uppercase tracking-wide text-ink/70 transition-colors duration-150 ease-out hover:text-ink md:inline ${focusRing}`}
            >
              התחברות
            </Link>
          )}
          <PillButton variant="secondary">פרסם מודעה</PillButton>
        </div>
      </nav>
    </header>
  );
}
