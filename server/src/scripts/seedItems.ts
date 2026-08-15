// server/src/scripts/seedItems.ts
// Seeds mock items for every leaf category so each category page has content to browse.
// Run with: npm run seed:items
import dotenv from 'dotenv';
import dns from 'dns';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user';
import Item from '../models/item';

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

const SEED_SELLER_EMAIL = 'mock-seller@yad2.local';

const mockItems: {
  category: string;
  title: string;
  description: string;
  price: number;
  image: string;
}[] = [
  // נדל"ן / להשכרה
  {
    category: 'נדל"ן / להשכרה / בית/קוטג׳',
    title: "קוטג' מרווח להשכרה בכפר סבא",
    description: '4 חדרים, גינה פרטית וחניה מקורה, קרוב למרכזי קניות ותחבורה ציבורית.',
    price: 8500,
    image: 'https://picsum.photos/seed/cottage-rent-1/640/480',
  },
  {
    category: 'נדל"ן / להשכרה / בית/קוטג׳',
    title: 'בית פרטי עם גינה להשכרה ברעננה',
    description: 'בית צמוד קרקע, 5 חדרים, משופץ לחלוטין ומוכן למגורים מיידיים.',
    price: 11000,
    image: 'https://picsum.photos/seed/cottage-rent-2/640/480',
  },
  {
    category: 'נדל"ן / להשכרה / דירה',
    title: 'דירת 3 חדרים להשכרה בתל אביב',
    description: 'קומה 2, מעלית, מרפסת שמש, קרוב לים ולתחבורה ציבורית.',
    price: 7200,
    image: 'https://picsum.photos/seed/apt-rent-1/640/480',
  },
  {
    category: 'נדל"ן / להשכרה / דירה',
    title: 'דירת סטודיו מעוצבת במרכז חיפה',
    description: 'דירה קטנה ומעוצבת, מושלמת לסטודנט/ית או זוג צעיר.',
    price: 3800,
    image: 'https://picsum.photos/seed/apt-rent-2/640/480',
  },
  {
    category: 'נדל"ן / להשכרה / יחידת דיור',
    title: 'יחידת דיור להשכרה ליד הקמפוס',
    description: 'יחידה מרוהטת עם כניסה נפרדת, מרחק הליכה מהאוניברסיטה.',
    price: 2600,
    image: 'https://picsum.photos/seed/unit-rent-1/640/480',
  },
  {
    category: 'נדל"ן / להשכרה / יחידת דיור',
    title: 'יחידת דיור מרוהטת בבאר שבע',
    description: 'יחידה קומפקטית וחדשה, כוללת מטבחון ומיזוג.',
    price: 2200,
    image: 'https://picsum.photos/seed/unit-rent-2/640/480',
  },

  // נדל"ן / מכירה
  {
    category: 'נדל"ן / מכירה / בית/קוטג׳',
    title: "קוטג' פרטי למכירה במושב",
    description: 'מגרש 500 מ"ר, בית 6 חדרים, בריכה פרטית וחצר מטופחת.',
    price: 3200000,
    image: 'https://picsum.photos/seed/cottage-sale-1/640/480',
  },
  {
    category: 'נדל"ן / מכירה / בית/קוטג׳',
    title: 'בית 5 חדרים למכירה בהרצליה',
    description: 'בית משופץ, קרוב לבתי ספר ולים, אפשרות להרחבה.',
    price: 4650000,
    image: 'https://picsum.photos/seed/cottage-sale-2/640/480',
  },
  {
    category: 'נדל"ן / מכירה / דירה',
    title: 'דירת 4 חדרים למכירה בגבעתיים',
    description: 'קומה גבוהה, נוף פתוח, ממ"ד, חניה ומחסן.',
    price: 2850000,
    image: 'https://picsum.photos/seed/apt-sale-1/640/480',
  },
  {
    category: 'נדל"ן / מכירה / דירה',
    title: 'דירת גן למכירה בפתח תקווה',
    description: 'דירת גן עם חצר של 80 מ"ר, כניסה פרטית ושני חניות.',
    price: 2100000,
    image: 'https://picsum.photos/seed/apt-sale-2/640/480',
  },
  {
    category: 'נדל"ן / מכירה / יחידת דיור',
    title: 'יחידת דיור להשקעה למכירה',
    description: 'יחידה מושכרת בתשואה גבוהה, מתאימה למשקיעים.',
    price: 780000,
    image: 'https://picsum.photos/seed/unit-sale-1/640/480',
  },
  {
    category: 'נדל"ן / מכירה / יחידת דיור',
    title: 'יחידת דיור קומפקטית למכירה במרכז',
    description: 'יחידה חדשה לחלוטין, מושלמת למגורים או השכרה.',
    price: 650000,
    image: 'https://picsum.photos/seed/unit-sale-2/640/480',
  },

  // רכבים
  {
    category: 'רכבים',
    title: 'טויוטה קורולה 2019, יד ראשונה',
    description: '65,000 ק"מ, אוטומטית, טסט ל-12 חודשים, ללא תאונות.',
    price: 78000,
    image: 'https://picsum.photos/seed/car-1/640/480',
  },
  {
    category: 'רכבים',
    title: 'מאזדה 3 2020 במצב מצוין',
    description: 'רכב טרייד-אין, שמור מאוד, מלווה בהיסטוריית טיפולים מלאה.',
    price: 92000,
    image: 'https://picsum.photos/seed/car-2/640/480',
  },
  {
    category: 'רכבים',
    title: "קיה ספורטאז' 2018",
    description: 'רכב שטח משפחתי, מרכב תקין, גומיות חדשות.',
    price: 105000,
    image: 'https://picsum.photos/seed/car-3/640/480',
  },

  // מוצרים
  {
    category: 'מוצרים / מוצרי חשמל',
    title: 'מכונת כביסה כמעט חדשה',
    description: 'שימוש של חצי שנה בלבד, 8 ק"ג, כל התעודות שמורות.',
    price: 1200,
    image: 'https://picsum.photos/seed/electronics-1/640/480',
  },
  {
    category: 'מוצרים / מוצרי חשמל',
    title: 'מקרר דו דלתי',
    description: 'מקרר במצב מצוין, קיבולת גדולה, חסכוני בחשמל.',
    price: 1800,
    image: 'https://picsum.photos/seed/electronics-2/640/480',
  },
  {
    category: 'מוצרים / טלפונים',
    title: 'אייפון 13 פרו במצב מעולה',
    description: '128GB, סוללה 91%, כולל קופסה ומטען.',
    price: 2400,
    image: 'https://picsum.photos/seed/phone-1/640/480',
  },
  {
    category: 'מוצרים / טלפונים',
    title: 'סמסונג גלקסי S22',
    description: 'מצב חדש כמעט, ללא שריטות, כולל כיסוי מגן.',
    price: 1600,
    image: 'https://picsum.photos/seed/phone-2/640/480',
  },
  {
    category: 'מוצרים / מוצרי בית',
    title: 'ספה תלת מושבית',
    description: 'ספת בד אפורה, נוחה מאוד, ללא כתמים או קרעים.',
    price: 900,
    image: 'https://picsum.photos/seed/home-1/640/480',
  },
  {
    category: 'מוצרים / מוצרי בית',
    title: 'שולחן אוכל עץ מלא',
    description: 'שולחן ל-6 סועדים, עץ אלון מלא, מצב מצוין.',
    price: 1100,
    image: 'https://picsum.photos/seed/home-2/640/480',
  },
  {
    category: 'מוצרים / גינה',
    title: 'נדנדת גן זוגית',
    description: 'נדנדה מעץ עם גג בד, מתאימה לגינה או מרפסת גדולה.',
    price: 650,
    image: 'https://picsum.photos/seed/garden-1/640/480',
  },
  {
    category: 'מוצרים / גינה',
    title: 'ברביקיו גז חדש כמעט',
    description: 'ברביקיו גז 4 מבערים, שימוש בודד, כולל בלון גז.',
    price: 750,
    image: 'https://picsum.photos/seed/garden-2/640/480',
  },
];

async function seedItems() {
  await mongoose.connect(process.env.MONGODB_CONNECTION as string);
  console.log('Connected to MongoDB');

  let seller = await User.findOne({ email: SEED_SELLER_EMAIL });
  if (!seller) {
    seller = await User.create({
      firstName: 'יד2',
      lastName: 'דוגמה',
      email: SEED_SELLER_EMAIL,
      password: bcrypt.hashSync('mock-seller-password', 10),
      phone: '0501234567',
      tokens: [],
    });
    console.log('Created mock seller user');
  }

  await Item.deleteMany({ sellerId: seller._id });

  const itemsToInsert = mockItems.map((item) => ({
    title: item.title,
    description: item.description,
    price: item.price,
    category: item.category,
    images: [item.image],
    sellerId: seller!._id,
    status: 'Active' as const,
  }));

  await Item.insertMany(itemsToInsert);
  console.log(`Seeded ${itemsToInsert.length} mock items across ${mockItems.length} listings`);

  await mongoose.disconnect();
}

seedItems().catch((error) => {
  console.error('Failed to seed items:', error);
  process.exit(1);
});
