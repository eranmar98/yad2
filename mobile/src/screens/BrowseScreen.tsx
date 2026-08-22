import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ItemsServices, { type Item } from '../services/itemsServices';
import { categoryTree } from '../data/categories';
import ContactSellerButton from '../components/ContactSellerModal';
import type { MainTabParamList } from '../navigation/types';

const REAL_ESTATE_LABEL = 'נדל"ן';
const realEstateNode = categoryTree.find(
  (node) => node.label === REAL_ESTATE_LABEL,
);
const dealTypeOptions =
  realEstateNode?.subCategories?.map((node) => node.label) ?? [];
const propertyTypeOptions =
  realEstateNode?.subCategories?.[0]?.subCategories?.map(
    (node) => node.label,
  ) ?? [];

function toggleInSet(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function FilterChip({
  label,
  isSelected,
  onToggle,
}: {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className={`flex-row items-center gap-2 rounded-full border px-3 py-2 ${
        isSelected ? 'border-navy bg-navy/5' : 'border-ink/15'
      }`}
    >
      <FontAwesome5
        name={isSelected ? 'check-square' : 'square'}
        size={14}
        color={isSelected ? '#152A4E' : '#11120866'}
        solid={isSelected}
      />
      <Text className='font-sans text-sm text-ink'>{label}</Text>
    </Pressable>
  );
}

export default function BrowseScreen() {
  const route = useRoute<RouteProp<MainTabParamList, 'Browse'>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<MainTabParamList>>();
  const keyword = route.params?.q ?? '';
  const category = route.params?.category ?? '';
  const hasSearch = Boolean(keyword || category);

  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isRealEstate =
    category === REAL_ESTATE_LABEL ||
    category.startsWith(`${REAL_ESTATE_LABEL} / `);
  const [filterState, setFilterState] = useState({
    category,
    dealTypes: new Set(dealTypeOptions),
    propertyTypes: new Set(propertyTypeOptions),
  });

  useEffect(() => {
    ItemsServices.getItems({
      keyword: keyword || undefined,
      category: category || undefined,
    })
      .then(setItems)
      .finally(() => setIsLoading(false));
  }, [keyword, category]);

  const categorySelections = useMemo(() => {
    const [, dealPart, propertyPart] = category.split(' / ');
    return {
      dealTypes: new Set(dealPart ? [dealPart] : dealTypeOptions),
      propertyTypes: new Set(
        propertyPart ? [propertyPart] : propertyTypeOptions,
      ),
    };
  }, [category]);

  const selectedDealTypes =
    filterState.category === category
      ? filterState.dealTypes
      : categorySelections.dealTypes;
  const selectedPropertyTypes =
    filterState.category === category
      ? filterState.propertyTypes
      : categorySelections.propertyTypes;

  const dealFilterActive = selectedDealTypes.size < dealTypeOptions.length;
  const propertyFilterActive =
    selectedPropertyTypes.size < propertyTypeOptions.length;

  const visibleItems = useMemo(() => {
    if (!isRealEstate || (!dealFilterActive && !propertyFilterActive))
      return items;
    return items.filter((item) => {
      const [, dealPart, propertyPart] = item.category.split(' / ');
      if (dealFilterActive && !(dealPart && selectedDealTypes.has(dealPart)))
        return false;
      if (
        propertyFilterActive &&
        !(propertyPart && selectedPropertyTypes.has(propertyPart))
      )
        return false;
      return true;
    });
  }, [
    items,
    isRealEstate,
    dealFilterActive,
    propertyFilterActive,
    selectedDealTypes,
    selectedPropertyTypes,
  ]);

  return (
    <SafeAreaView edges={['top']} className='flex-1 bg-white'>
      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperClassName='gap-4'
        contentContainerClassName='px-6 pb-16 pt-6 gap-4'
        ListHeaderComponent={
          <View className='mb-4'>
            <Text className='text-center font-display text-2xl font-extrabold text-ink'>
              מודעות
            </Text>
            {hasSearch && (
              <Text className='mt-2 text-center font-sans text-sm text-ink/60'>
                {category ? `קטגוריה: ${category}` : ''}
                {category && keyword ? ' · ' : ''}
                {keyword ? `תוצאות חיפוש עבור "${keyword}"` : ''}
              </Text>
            )}

            {isRealEstate && (
              <View className='mt-5 rounded-2xl border border-ink/10 p-4'>
                <Text className='mb-3 text-right font-display text-sm font-bold text-ink'>
                  סינון נדל"ן
                </Text>
                <Text className='mb-2 text-right font-sans text-xs font-bold text-ink/50'>
                  סוג עסקה
                </Text>
                <View className='mb-4 flex-row flex-wrap gap-2'>
                  {dealTypeOptions.map((label) => (
                    <FilterChip
                      key={label}
                      label={label}
                      isSelected={selectedDealTypes.has(label)}
                      onToggle={() =>
                        setFilterState({
                          category,
                          dealTypes: toggleInSet(selectedDealTypes, label),
                          propertyTypes: selectedPropertyTypes,
                        })
                      }
                    />
                  ))}
                </View>
                <Text className='mb-2 text-right font-sans text-xs font-bold text-ink/50'>
                  סוג נכס
                </Text>
                <View className='flex-row flex-wrap gap-2'>
                  {propertyTypeOptions.map((label) => (
                    <FilterChip
                      key={label}
                      label={label}
                      isSelected={selectedPropertyTypes.has(label)}
                      onToggle={() =>
                        setFilterState({
                          category,
                          dealTypes: selectedDealTypes,
                          propertyTypes: toggleInSet(
                            selectedPropertyTypes,
                            label,
                          ),
                        })
                      }
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator className='mt-10' color='#152A4E' />
          ) : (
            <View className='mt-10 items-center'>
              <Text className='text-center font-sans text-ink/60'>
                {hasSearch
                  ? 'לא מצאנו את מה שחיפשת... נסה מיקום אחר'
                  : 'אין עדיין מודעות פעילות'}
              </Text>
              {hasSearch && (
                <Pressable
                  onPress={() =>
                    navigation.setParams({ category: undefined, q: undefined })
                  }
                  className='mt-3'
                >
                  <Text className='font-sans text-sm text-navy underline'>
                    נקו את החיפוש וראו את כל המודעות
                  </Text>
                </Pressable>
              )}
            </View>
          )
        }
        renderItem={({ item }) => (
          <View className='flex-1 overflow-hidden rounded-2xl border border-ink/10'>
            {item.images?.[0] ? (
              <Image
                source={{ uri: item.images[0] }}
                className='h-32 w-full'
                resizeMode='cover'
              />
            ) : (
              <View className='h-32 w-full items-center justify-center bg-navy/5'>
                <Text className='font-sans text-xs text-ink/40'>אין תמונה</Text>
              </View>
            )}
            <View className='p-3'>
              <Text className='text-right font-sans text-xs font-medium text-navy'>
                {item.category}
              </Text>
              <Text
                numberOfLines={1}
                className='mt-1 text-right font-display text-sm font-bold text-ink'
              >
                {item.title}
              </Text>
              <Text className='mt-1 text-right font-display text-base font-bold text-navy'>
                {item.price} ₪
              </Text>
              <ContactSellerButton
                item={item}
                className='mt-3 w-full px-2 py-2'
              />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
