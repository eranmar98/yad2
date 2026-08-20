import { useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAiClient } from '../api/ai';
import { flattenCategoryPaths } from '../data/categories';
import type { RootStackParamList } from '../navigation/types';

type ParsedSearch = {
  category: string | null;
  keyword: string | null;
};

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const parseSearch = async (text: string): Promise<ParsedSearch> => {
    const options = flattenCategoryPaths();
    const prompt = `להלן רשימת קטגוריות קיימות באתר מודעות:\n${options.map((o) => `- ${o}`).join('\n')}\n\nהמשתמש חיפש: "${text}"\n\nהחזירו JSON בלבד, בלי טקסט נוסף, בפורמט:\n{"category": "השם המדויק מהרשימה שהכי מתאים, או null אם אין התאמה", "keyword": "מילות חיפוש חופשיות שלא קשורות לקטגוריה עצמה (כמו מיקום), או null אם אין"}\n\nלדוגמה, עבור "בית להשכרה ברעננה": {"category": "נדל\\"ן / להשכרה / בית/קוטג׳", "keyword": "רעננה"}`;

    try {
      const ai = getAiClient();
      const result = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });
      const raw = result.text?.trim().replace(/^```json\s*|\s*```$/g, '') ?? '{}';
      const parsed = JSON.parse(raw);
      const category = options.includes(parsed.category) ? parsed.category : null;
      const keyword =
        typeof parsed.keyword === 'string' && parsed.keyword.trim() ? parsed.keyword.trim() : null;
      return { category, keyword };
    } catch (error) {
      console.error('AI search parsing failed:', error);
      return { category: null, keyword: text };
    }
  };

  const handleSubmit = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSearching(true);
    const { category, keyword } = await parseSearch(trimmed);
    setIsSearching(false);

    const params: { category?: string; q?: string } = {};
    if (category) params.category = category;
    // Only fall back to the raw query text when nothing matched a category —
    // otherwise it re-filters an already-matched category by its own name and finds nothing.
    if (keyword) {
      params.q = keyword;
    } else if (!category) {
      params.q = trimmed;
    }
    navigation.navigate('MainTabs', { screen: 'Browse', params });
  };

  return (
    <View className="w-full flex-row items-center gap-2 rounded-pill bg-white p-2 shadow-xl">
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="מה מחפשים היום? רכב, דירה, מוצר..."
        placeholderTextColor="#11120866"
        textAlign="right"
        onSubmitEditing={handleSubmit}
        className="min-w-0 flex-1 px-4 py-3 font-sans text-base text-ink"
      />
      <Pressable onPress={handleSubmit} disabled={isSearching} className="overflow-hidden rounded-pill">
        <LinearGradient
          colors={['#152A4E', '#0ea5e9', '#22406F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center gap-2 px-5 py-3.5"
        >
          {isSearching ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <FontAwesome5 name="search" size={16} color="white" />
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}
