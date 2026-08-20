import { Link } from 'react-router-dom';
import {
  HiOutlineEnvelope,
  HiOutlineHeart,
  HiOutlineArrowTrendingUp,
  HiOutlineRectangleGroup,
  HiOutlinePlusCircle,
  HiOutlineSparkles,
} from 'react-icons/hi2';
import type { IUser } from '../../../models/user';
import PillButton from '../PillButton';

type DashboardSidebarProps = {
  user: IUser | null;
  listingsCount: number;
  messagesCount: number;
  favoritesCount: number;
  onOpenAdManagement: () => void;
};

function initialsOf(user: IUser | null): string {
  if (!user) return '?';
  return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
}

export default function DashboardSidebar({
  user,
  listingsCount,
  messagesCount,
  favoritesCount,
  onOpenAdManagement,
}: DashboardSidebarProps) {
  const stats = [
    { label: 'מודעות', value: listingsCount, icon: HiOutlineRectangleGroup },
    { label: 'הודעות', value: messagesCount, icon: HiOutlineEnvelope },
    { label: 'מועדפים', value: favoritesCount, icon: HiOutlineHeart },
  ];

  const navItems = [
    {
      to: '/inquiries',
      label: 'ההודעות שלי',
      sublabel: 'פניות שקיבלת על המודעות שלך',
      icon: HiOutlineEnvelope,
      count: messagesCount,
    },
    {
      to: '/favorites',
      label: 'המועדפים שלי',
      sublabel: 'מודעות ששמרת לצפייה מאוחרת',
      icon: HiOutlineHeart,
      count: favoritesCount,
    },
  ];

  return (
    <aside className="flex w-full shrink-0 flex-col lg:w-96">
      <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-navy via-navy-soft to-[#0d1b34] p-6 text-white sm:p-8 lg:p-10">
        <div
          aria-hidden
          className="animate-drift absolute -top-16 -left-16 h-72 w-72 rounded-full bg-sky-400/25 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-drift-reverse absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-brand-purple/20 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-drift absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl"
          style={{ animationDelay: '2s' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="animate-fade-in-up relative flex flex-1 flex-col">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15 font-display text-xl font-extrabold ring-2 ring-white/25 backdrop-blur-sm">
              {initialsOf(user)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-bold">
                {user ? `${user.firstName} ${user.lastName}` : 'המשתמש שלי'}
              </p>
              <p className="truncate font-sans text-xs text-white/55">{user?.email}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2.5">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="animate-fade-in-up rounded-2xl bg-white/[0.08] px-2 py-3.5 text-center ring-1 ring-white/10 backdrop-blur-sm"
                style={{ animationDelay: `${i * 60 + 80}ms` }}
              >
                <p className="font-display text-xl font-extrabold tabular-nums">{stat.value}</p>
                <p className="mt-0.5 font-sans text-[10px] text-white/65">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="my-7 h-px bg-white/10" />

          <nav className="flex flex-col gap-1.5">
            {navItems.map((item, i) => (
              <Link
                key={item.to}
                to={item.to}
                className="animate-fade-in-up group flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors duration-150 ease-out hover:bg-white/[0.08] active:scale-[0.99]"
                style={{ animationDelay: `${i * 60 + 150}ms` }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10 transition-transform duration-150 ease-out group-hover:scale-105">
                  <item.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-sans text-sm font-bold">{item.label}</span>
                  <span className="block truncate font-sans text-xs text-white/50">
                    {item.sublabel}
                  </span>
                </span>
                {item.count > 0 && (
                  <span className="shrink-0 rounded-pill bg-white px-2 py-0.5 font-sans text-xs font-bold tabular-nums text-navy">
                    {item.count}
                  </span>
                )}
              </Link>
            ))}

            <button
              type="button"
              onClick={onOpenAdManagement}
              className="animate-fade-in-up group flex items-center gap-3 rounded-2xl px-3 py-3 text-right transition-colors duration-150 ease-out hover:bg-white/[0.08] active:scale-[0.99]"
              style={{ animationDelay: '270ms' }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-brand-purple ring-1 ring-white/10 transition-transform duration-150 ease-out group-hover:scale-105">
                <HiOutlineArrowTrendingUp className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-sans text-sm font-bold">ניהול מודעות</span>
                <span className="block truncate font-sans text-xs text-white/50">
                  ביצועים ורמת עניין לכל מודעה
                </span>
              </span>
            </button>
          </nav>

          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
            <HiOutlineSparkles className="animate-float h-12 w-12 text-white/15" />
            <p className="max-w-[14rem] font-sans text-xs leading-relaxed text-white/30">
              מודעות עם תמונה ברורה ומחיר הוגן מקבלות הכי הרבה פניות
            </p>
          </div>

          <Link to="/publish" className="animate-fade-in-up" style={{ animationDelay: '340ms' }}>
            <PillButton variant="inverse" className="w-full gap-2">
              <HiOutlinePlusCircle className="h-5 w-5" />
              פרסום מודעה חדשה
            </PillButton>
          </Link>
        </div>
      </div>
    </aside>
  );
}
