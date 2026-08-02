// קישורי הניווט העליון. active=true מסמן את העמוד הנוכחי
export type NavLink = {
    label: string;
    href: string;
    active?: boolean;
  };
  
  export const navLinks: NavLink[] = [
    { label: "בית", href: "#", active: true },
    { label: "מודעות", href: "#listings" },
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
    { id: 3, lines: ["תשלום מאובטח", "משלוח עד הבית", "תמיכה 24/6"] },
    { id: 4, lines: ["ללא עמלות פרסום"] },
    { id: 5, lines: ["רכבים", "נדל״ן", "אלקטרוניקה", "רהיטים"], align: "end" },
  ];