import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ItemsServices, { type Item } from '../services/itemsServices';
import type { RootStackParamList } from '../navigation/types';

export default function MyListingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      ItemsServices.getMyItems()
        .then(setItems)
        .finally(() => setIsLoading(false));
    }, []),
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperClassName="gap-4"
        contentContainerClassName="px-6 pb-16 pt-6 gap-4"
        ListHeaderComponent={
          <View className="mb-6 flex flex-col gap-4">
            <Text className="text-center font-display text-2xl font-extrabold text-ink">
              המודעות שלי
            </Text>
            <View className="flex-row justify-center gap-4">
              <Text
                onPress={() => navigation.navigate('Inquiries')}
                className="font-sans text-sm font-bold text-navy underline"
              >
                פניות שקיבלתי
              </Text>
              <Text
                onPress={() => navigation.navigate('MainTabs', { screen: 'Publish' })}
                className="font-sans text-sm font-bold text-navy underline"
              >
                + מודעה חדשה
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator className="mt-10" color="#152A4E" />
          ) : (
            <Text className="mt-10 text-center font-sans text-ink/60">עוד לא פרסמת מודעות</Text>
          )
        }
        renderItem={({ item }) => (
          <View className="flex-1 overflow-hidden rounded-2xl border border-ink/10">
            {item.images?.[0] ? (
              <Image source={{ uri: item.images[0] }} className="h-28 w-full" resizeMode="cover" />
            ) : (
              <View className="h-28 w-full items-center justify-center bg-navy/5">
                <Text className="font-sans text-xs text-ink/40">אין תמונה</Text>
              </View>
            )}
            <View className="p-3">
              <View className="flex-row items-start justify-between gap-2">
                <Text numberOfLines={1} className="flex-1 text-right font-display text-sm font-bold text-ink">
                  {item.title}
                </Text>
                <View className={`rounded-full px-2 py-1 ${item.status === 'Active' ? 'bg-navy/10' : 'bg-gray-100'}`}>
                  <Text className={`font-sans text-[10px] font-medium ${item.status === 'Active' ? 'text-navy' : 'text-gray-500'}`}>
                    {item.status === 'Active' ? 'פעילה' : 'נמכר'}
                  </Text>
                </View>
              </View>
              <Text numberOfLines={2} className="mt-1 text-right font-sans text-xs text-ink/60">
                {item.description}
              </Text>
              <Text className="mt-2 text-right font-display text-base font-bold text-navy">
                {item.price} ₪
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
