import { Text, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const steps = [
  {
    icon: 'user-plus' as const,
    title: 'נרשמים',
    description: 'יוצרים חשבון תוך שניות ומתחילים להשתמש בפלטפורמה',
    accent: '#152A4E',
  },
  {
    icon: 'box-open' as const,
    title: 'בוחרים מה לפרסם',
    description: 'מעלים תמונה, כותבים תיאור קצר ובוחרים קטגוריה',
    accent: '#0ea5e9',
  },
  {
    icon: 'comment-dots' as const,
    title: 'מקבלים הודעה ישירות מהמתעניין',
    description: 'המתעניינים כותבים לכם ישירות, בלי מתווכים ובלי עמלות',
    accent: '#93AC80',
  },
];

export default function HowItWorks() {
  return (
    <View className="mt-14 px-6">
      <Text className="text-center font-display text-2xl font-extrabold text-ink">איך זה עובד?</Text>
      <Text className="mt-2 text-center font-sans text-ink/60">
        שלושה צעדים פשוטים, מהרשמה ועד עסקה
      </Text>

      <View className="mt-8 flex flex-col gap-5">
        {steps.map((step, index) => (
          <View
            key={step.title}
            className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm"
          >
            <View
              className="mb-4 h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: step.accent }}
            >
              <FontAwesome5 name={step.icon} size={18} color="white" />
            </View>
            <Text className="text-right font-display text-base font-bold text-ink">
              {index + 1}. {step.title}
            </Text>
            <Text className="mt-2 text-right font-sans text-sm leading-relaxed text-ink/60">
              {step.description}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
