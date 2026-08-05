// קישורי הניווט העליון. מצב "פעיל" נגזר מהנתיב הנוכחי (ראו Navbar), לא מוגדר כאן
export type NavLink = {
  label: string;
  href: string;
};

export const navLinks: NavLink[] = [
  { label: "בית", href: "/" },
  { label: "מודעות", href: "/browse" },
  { label: "קטגוריות", href: "#categories" },
  { label: "איך זה עובד", href: "#how-it-works" },
  { label: "צור קשר", href: "#contact" },
];

// שורת הנתונים מתחת לכותרת הראשית. align: "end" מיישר עמודה לצד השני
export type StatItem = {
  id: number;
  lines: string[];
  align?: "end";
};

export const stats: StatItem[] = [
  { id: 1, lines: ["50,000+ מודעות פעילות"] },
  { id: 2, lines: ["12 קטגוריות מוצרים"] },
  { id: 3, lines: ["יצירת קשר ישירה עם המוכר", "בלי עמלות, בלי תיווך"] },
  { id: 4, lines: ["ללא עמלות פרסום"] },
  { id: 5, lines: ["רכבים", "נדל״ן", "אלקטרוניקה", "רהיטים"], align: "end" },
];