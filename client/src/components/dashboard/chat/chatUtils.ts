import type { Conversation } from '../../../services/inquiriesServices';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function daysAgo(value: string): number {
  return Math.round((startOfDay(new Date()) - startOfDay(new Date(value))) / DAY_MS);
}

export function formatClock(value: string): string {
  return new Date(value).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

/** Compact time for the conversation list: 14:32 / אתמול / יום ג׳ / 3.5.26 */
export function formatListTime(value: string): string {
  const diff = daysAgo(value);
  if (diff === 0) return formatClock(value);
  if (diff === 1) return 'אתמול';
  if (diff < 7) return new Date(value).toLocaleDateString('he-IL', { weekday: 'short' });
  return new Date(value).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: '2-digit' });
}

/** Day separator inside a thread: היום / אתמול / יום ראשון, 4 באוקטובר */
export function formatDayLabel(value: string): string {
  const diff = daysAgo(value);
  if (diff === 0) return 'היום';
  if (diff === 1) return 'אתמול';
  return new Date(value).toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: diff > 300 ? 'numeric' : undefined,
  });
}

export function isSameDay(a: string, b: string): boolean {
  return startOfDay(new Date(a)) === startOfDay(new Date(b));
}

export function displayName(conversation: Conversation): string {
  const user = conversation.otherUser;
  return user ? `${user.firstName} ${user.lastName}`.trim() : 'משתמש/ת';
}

export function initialsOf(conversation: Conversation): string {
  const user = conversation.otherUser;
  if (!user) return '?';
  return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
}

const AVATAR_COLORS = [
  'from-sky-400 to-navy',
  'from-brand-purple-soft to-brand-purple-deep',
  'from-emerald-400 to-teal-700',
  'from-amber-400 to-orange-600',
  'from-rose-400 to-pink-700',
];

/** A stable gradient per person, so the same user always gets the same avatar color. */
export function avatarColor(conversation: Conversation): string {
  const key = conversation.otherUser?._id ?? conversation._id;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function roleLabel(conversation: Conversation): string {
  return conversation.role === 'seller' ? 'מתעניין/ת במודעה שלך' : 'מוכר/ת';
}
