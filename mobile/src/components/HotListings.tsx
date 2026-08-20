import { useEffect, useState } from 'react';
import { FlatList, Image, Text, View } from 'react-native';
import ItemsServices, { type Item } from '../services/itemsServices';

export default function HotListings() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    ItemsServices.getItems()
      .then((data) => setItems(data.slice(0, 14)))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  return (
    <View className="mt-10">
      <Text className="text-center font-display text-2xl font-extrabold text-ink">
        <Text className="text-brand-purple">מודעות</Text> חמות
      </Text>
      <Text className="mt-2 text-center font-sans text-ink/60">גררו ימינה ושמאלה לעוד מודעות</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-4 px-6 py-6"
        renderItem={({ item }) => (
          <View
            className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm"
            style={{ width: 220 }}
          >
            {item.images?.[0] ? (
              <Image source={{ uri: item.images[0] }} className="h-36 w-full" resizeMode="cover" />
            ) : (
              <View className="h-36 w-full items-center justify-center bg-navy/5">
                <Text className="font-sans text-sm text-ink/40">אין תמונה</Text>
              </View>
            )}
            <View className="p-4">
              <Text className="text-right font-sans text-xs font-medium text-brand-purple">
                {item.category}
              </Text>
              <Text numberOfLines={1} className="mt-1 text-right font-display text-base font-bold text-ink">
                {item.title}
              </Text>
              <Text className="mt-2 text-right font-display text-lg font-bold text-navy">
                {item.price} ₪
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
