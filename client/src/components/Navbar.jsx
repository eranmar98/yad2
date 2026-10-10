import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaChevronDown, FaTimes } from 'react-icons/fa';
import { navLinks } from '../siteContent';
import PillButton from './PillButton';
import useUsersStore from '../store/usersStore';
import logo from '../assets/logo.svg';

const subCategories = ['נדל"ן', 'רכבים', 'מוצרים'];

const focusRing =
  'outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2';
const navLinkBase = `font-sans text-base font-bold transition-colors duration-150 ease-out ${focusRing}`;

export default function Navbar() {
  const navigate = useNavigate();
  const user = useUsersStore((state) => state.user);
  const token = useUsersStore((state) => state.token);
  const logout = useUsersStore((state) => state.logout);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  // Close the mobile menu on Escape, and if the viewport grows past the md
  // breakpoint while it's open (the desktop nav takes over there).
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e) => e.key === 'Escape' && setMenuOpen(false);
    const mq = window.matchMedia('(min-width: 48rem)');
    const onResize = () => mq.matches && setMenuOpen(false);
    window.addEventListener('keydown', onKeyDown);
    mq.addEventListener('change', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      mq.removeEventListener('change', onResize);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/');
  };

  const mobileLinkClass = (isActive = false) =>
    `block rounded-lg px-3 py-3 ${navLinkBase} ${
      isActive ? 'bg-navy/5 text-navy' : 'text-ink/80 hover:bg-navy/5 hover:text-navy'
    }`;

  return (
    <header className="relative z-30 w-full border-b border-ink/10 bg-white">
      <nav className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-4 md:px-6">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'סגירת תפריט' : 'פתיחת תפריט'}
          className={`justify-self-start p-2 text-ink/70 transition-colors duration-150 ease-out hover:text-navy md:hidden ${focusRing}`}
        >
          {menuOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
        </button>

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
                    <Link
                      key={sub}
                      to={`/browse?category=${encodeURIComponent(sub)}`}
                      className="block rounded-lg px-3 py-2 font-sans text-sm text-ink/80 transition-colors duration-150 ease-out hover:bg-navy/5 hover:text-navy"
                    >
                      {sub}
                    </Link>
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
          <Link to="/" className={focusRing}>
            <img src={logo} alt="לוח מודעות" className="h-11 w-auto" />
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
          <PillButton
            variant="secondary"
            onClick={() => {
              closeMenu();
              navigate('/publish');
            }}
          >
            פרסם מודעה
          </PillButton>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={`absolute inset-x-0 top-full grid border-ink/10 bg-white shadow-lg transition-[grid-template-rows,visibility] duration-200 ease-out md:hidden ${
          menuOpen ? 'visible grid-rows-[1fr] border-b' : 'invisible grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <ul className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) =>
              link.label === 'קטגוריות' ? (
                <li key={link.href}>
                  <span className="block px-3 pt-3 pb-1 font-sans text-xs font-bold text-ink/50">
                    {link.label}
                  </span>
                  <ul className="flex flex-col">
                    {subCategories.map((sub) => (
                      <li key={sub}>
                        <Link
                          to={`/browse?category=${encodeURIComponent(sub)}`}
                          onClick={closeMenu}
                          className={`${mobileLinkClass()} pr-6 font-normal`}
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={link.href}>
                  {link.href.startsWith('/') ? (
                    <NavLink
                      to={link.href}
                      end={link.href === '/'}
                      onClick={closeMenu}
                      className={({ isActive }) => mobileLinkClass(isActive)}
                    >
                      {link.label}
                    </NavLink>
                  ) : (
                    <a href={link.href} onClick={closeMenu} className={mobileLinkClass()}>
                      {link.label}
                    </a>
                  )}
                </li>
              )
            )}

            <li className="mt-2 border-t border-ink/10 pt-2">
              {token ? (
                <>
                  <Link to="/my-listings" onClick={closeMenu} className={mobileLinkClass()}>
                    הפרופיל שלי{user?.firstName ? ` (${user.firstName})` : ''}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`${mobileLinkClass()} w-full text-right font-normal text-ink/60`}
                  >
                    התנתקות
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={closeMenu} className={mobileLinkClass()}>
                  התחברות
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}