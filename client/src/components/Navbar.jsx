import { navLinks } from '../siteContent';
import ToggleMark from '../ToggleMark';
import PillButton from './PillButton';

export default function Navbar() {
  return (
    <header className="w-full border-b border-ink/10">
      <nav className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4">
        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={
                  link.active
                    ? 'font-sans text-xs font-semibold uppercase tracking-wide text-ink'
                    : 'font-sans text-xs uppercase tracking-wide text-ink/60 hover:text-ink'
                }
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#" className="flex items-center justify-self-center gap-2">
          <ToggleMark />
          <span className="font-display text-lg font-extrabold text-ink">לוח מודעות</span>
        </a>

        <div className="flex items-center justify-self-end gap-4">
          <a
            href="#"
            className="hidden font-sans text-xs uppercase tracking-wide text-ink/70 hover:text-ink md:inline"
          >
            התחברות
          </a>
          <PillButton variant="secondary">פרסם מודעה</PillButton>
        </div>
      </nav>
    </header>
  );
}
