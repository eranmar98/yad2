import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import InquiriesServices, { type Inquiry } from '../services/inquiriesServices';
import type { Item } from '../services/itemsServices';
import type { RootStackParamList } from '../navigation/types';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const statusLabels: Record<Inquiry['status'], string> = {
  Pending: 'ממתין',
  Answered: 'נענה',
  Closed: 'סגור',
};

export default function InquiriesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    InquiriesServices.getReceivedInquiries()
      .then(setInquiries)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <FlatList
        data={inquiries}
        keyExtractor={(inquiry) => inquiry._id}
        contentContainerClassName="px-6 pb-16 pt-6 gap-4"
        ListHeaderComponent={
          <Text className="mb-4 text-right font-display text-2xl font-extrabold text-ink">
            פניות שקיבלתי
          </Text>
        }
        ListFooterComponent={
          <Text
            onPress={() => navigation.navigate('MainTabs', { screen: 'MyListings' })}
            className="mt-4 text-center font-sans text-sm text-navy underline"
          >
            חזרה למודעות שלי
          </Text>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator className="mt-10" color="#152A4E" />
          ) : (
            <Text className="mt-10 text-center font-sans text-ink/60">
              עוד לא התקבלו פניות על המודעות שלך
            </Text>
          )
        }
        renderItem={({ item: inquiry }) => {
          const item = typeof inquiry.itemId === 'string' ? null : (inquiry.itemId as Pick<Item, '_id' | 'title' | 'price' | 'images'>);
          const buyer = typeof inquiry.userId === 'string' ? null : inquiry.userId;

          return (
            <View className="rounded-2xl border border-ink/10 p-4">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-right font-sans text-xs text-ink/50">
                    {formatDate(inquiry.createdAt)}
                  </Text>
                  <Text className="mt-1 text-right font-display text-base font-bold text-ink">
                    {item ? item.title : 'מודעה'}
                  </Text>
                  {buyer && (
                    <Text className="mt-1 text-right font-sans text-sm text-ink/70">
                      מאת: {buyer.firstName} {buyer.lastName} · {buyer.phone} · {buyer.email}
                    </Text>
                  )}
                </View>
                <View className="rounded-full bg-navy/10 px-3 py-1">
                  <Text className="font-sans text-xs font-medium text-navy">
                    {statusLabels[inquiry.status]}
                  </Text>
                </View>
              </View>
              <Text className="mt-3 text-right font-sans text-sm text-ink/80">{inquiry.message}</Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
