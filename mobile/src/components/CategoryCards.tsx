import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

const categories = [
  {
    icon: 'home' as const,
    label: 'נדל"ן',
    description: 'דירות, בתים ומגרשים',
    gradient: ['#152A4E', '#22406F'] as const,
  },
  {
    icon: 'car' as const,
    label: 'רכבים',
    description: 'רכבים, אופנועים ועוד',
    gradient: ['#2563eb', '#0ea5e9'] as const,
  },
  {
    icon: 'shopping-bag' as const,
    label: 'מוצרים',
    description: 'ריהוט, אלקטרוניקה ועוד',
    gradient: ['#0ea5e9', '#22d3ee'] as const,
  },
];

export default function CategoryCards() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="mt-8 flex flex-col gap-4">
      {categories.map(({ icon, label, description, gradient }) => (
        <Pressable
          key={label}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Browse', params: { category: label } })}
          className="overflow-hidden rounded-3xl active:opacity-90"
        >
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex flex-col items-center gap-2 p-7"
          >
            <View className="h-14 w-14 items-center justify-center rounded-full bg-white/15">
              <FontAwesome5 name={icon} size={22} color="white" />
            </View>
            <Text className="font-display text-lg font-bold text-white">{label}</Text>
            <Text className="font-sans text-sm text-white/80">{description}</Text>
          </LinearGradient>
        </Pressable>
      ))}
    </View>
  );
}
