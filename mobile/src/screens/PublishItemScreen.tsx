import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { createPartFromBase64, createUserContent, type Part } from '@google/genai';
import ItemsServices from '../services/itemsServices';
import PillButton from '../components/PillButton';
import { getAiClient } from '../api/ai';
import { categoryTree, type CategoryNode } from '../data/categories';
import type { RootStackParamList } from '../navigation/types';

const categoryIcons: Record<string, string> = {
  'נדל"ן': 'home',
  רכבים: 'car',
  מוצרים: 'shopping-bag',
};

function getOptionsAtLevel(path: string[]): CategoryNode[] {
  let nodes = categoryTree;
  for (const label of path) {
    const found = nodes.find((n) => n.label === label);
    if (!found?.subCategories) return [];
    nodes = found.subCategories;
  }
  return nodes;
}

type PickedImage = {
  uri: string;
  mimeType: string;
  fileName: string;
  base64: string | null;
};

export default function PublishItemScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<PickedImage | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const isCategoryComplete = categoryPath.length > 0 && getOptionsAtLevel(categoryPath).length === 0;
  const categoryLabel = categoryPath.join(' / ');

  const handleSelectAt = (level: number, label: string) => {
    setCategoryPath((prev) => [...prev.slice(0, level), label]);
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('נדרשת הרשאה לגלריית התמונות');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setImage({
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
      fileName: asset.fileName ?? 'photo.jpg',
      base64: asset.base64 ?? null,
    });
  };

  const handleSubmit = async () => {
    setError('');

    if (!isCategoryComplete) {
      setError('יש לבחור קטגוריה עד הסוף');
      return;
    }
    if (!title.trim() || !description.trim() || !price) {
      setError('יש למלא את כל השדות');
      return;
    }

    setIsSubmitting(true);
    try {
      await ItemsServices.createItem({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category: categoryLabel,
        image: image ? { uri: image.uri, name: image.fileName, type: image.mimeType } : null,
      });
      navigation.navigate('MainTabs', { screen: 'MyListings' });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const serverMessage = (err.response?.data as { error?: string } | undefined)?.error;
        setError(`הפרסום נכשל (${status ?? 'שגיאת רשת'}): ${serverMessage ?? 'ללא פרטים נוספים'}`);
      } else {
        setError('הפרסום נכשל, נסו שוב');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerate = async () => {
    const prompt = `כתוב לי או שפר את המודעה שתהיה קצרה ומושכת למכירת ${categoryLabel} עם הכותרת "${title}" ותיאור "${description}". המחיר הוא ${price} ש"ח.${
      image ? ' התבסס גם על התמונה המצורפת של הפריט.' : ''
    } חשוב מאוד: החזר אך ורק את טקסט התיאור עצמו, ללא כותרות, ללא הסברים וללא עטיפה של מרכאות או Markdown.`;

    setIsLoadingAi(true);
    try {
      const ai = getAiClient();
      const parts: (string | Part)[] = [prompt];
      if (image?.base64) {
        parts.push(createPartFromBase64(image.base64, image.mimeType));
      }

      const result = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: createUserContent(parts),
      });

      if (!result.text) {
        setError('לא התקבלה תגובה מהמודל. נסה שוב מאוחר יותר.');
        return;
      }

      setDescription(result.text);
    } catch (err) {
      console.error('Error calling Gemini:', err);
      setError('שגיאה ביצירת תוכן. נסה שוב מאוחר יותר.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="px-6 py-8 pb-16" keyboardShouldPersistTaps="handled">
          <Text className="text-center font-display text-2xl font-extrabold text-ink">
            פרסום מודעה חדשה
          </Text>

          <View className="mt-8">
            <Text className="mb-3 text-right font-sans text-sm font-bold text-ink">1. באיזו קטגוריה?</Text>

            {[0, 1, 2].map((level) => {
              const options = getOptionsAtLevel(categoryPath.slice(0, level));
              if (options.length === 0) return null;
              return (
                <View key={level} className={level === 0 ? '' : 'mt-4'}>
                  {level > 0 && (
                    <Text className="mb-2 text-right font-sans text-sm text-ink/70">
                      {level === 1 ? 'תת-קטגוריה' : 'סוג'}
                    </Text>
                  )}
                  <View className={level === 0 ? 'flex-row flex-wrap gap-3' : 'flex-row flex-wrap gap-2'}>
                    {options.map((node) => {
                      const isSelected = categoryPath[level] === node.label;
                      if (level === 0) {
                        return (
                          <Pressable
                            key={node.label}
                            onPress={() => handleSelectAt(level, node.label)}
                            className={`flex-1 items-center gap-2 rounded-2xl border-2 p-4 ${
                              isSelected ? 'border-navy bg-navy/5' : 'border-ink/10'
                            }`}
                            style={{ minWidth: '30%' }}
                          >
                            <FontAwesome5
                              name={categoryIcons[node.label] ?? 'shopping-bag'}
                              size={20}
                              color={isSelected ? '#152A4E' : '#11120899'}
                            />
                            <Text className="text-center font-sans text-sm font-medium text-ink">
                              {node.label}
                            </Text>
                          </Pressable>
                        );
                      }
                      return (
                        <Pressable
                          key={node.label}
                          onPress={() => handleSelectAt(level, node.label)}
                          className={`rounded-pill border px-4 py-2 ${
                            isSelected ? 'border-navy bg-navy' : 'border-ink/15'
                          }`}
                        >
                          <Text className={`font-sans text-sm ${isSelected ? 'text-white' : 'text-ink/70'}`}>
                            {node.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>

          <View className="mt-8">
            <Text className="mb-3 text-right font-sans text-sm font-bold text-ink">2. פרטי המודעה</Text>

            <View className="flex flex-col gap-4">
              <View>
                <Text className="mb-1 text-right font-sans text-sm text-ink/70">כותרת</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder='למשל: "אייפון 13, מצב מעולה"'
                  textAlign="right"
                  className="rounded-xl border border-ink/15 px-4 py-3 font-sans text-ink"
                />
              </View>

              <View>
                <View className="mb-1 flex-row items-center justify-between gap-2">
                  <Pressable
                    onPress={handleGenerate}
                    disabled={isLoadingAi || categoryPath.length === 0}
                    className={`flex-row items-center gap-1.5 rounded-pill border border-navy/15 bg-navy/5 px-3 py-1.5 ${
                      isLoadingAi || categoryPath.length === 0 ? 'opacity-50' : ''
                    }`}
                  >
                    {isLoadingAi ? (
                      <ActivityIndicator size="small" color="#152A4E" />
                    ) : (
                      <FontAwesome5 name="magic" size={12} color="#152A4E" />
                    )}
                    <Text className="font-sans text-xs font-medium text-navy">
                      {isLoadingAi ? 'מייצר תיאור...' : 'שיפור תיאור באמצעות AI'}
                    </Text>
                  </Pressable>
                  <Text className="font-sans text-sm text-ink/70">תיאור</Text>
                </View>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="ספרו על הפריט..."
                  multiline
                  numberOfLines={4}
                  textAlign="right"
                  textAlignVertical="top"
                  className="h-28 rounded-xl border border-ink/15 px-4 py-3 font-sans text-ink"
                />
              </View>

              <View>
                <Text className="mb-1 text-right font-sans text-sm text-ink/70">מחיר (בש"ח)</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0"
                  keyboardType="numeric"
                  textAlign="right"
                  className="rounded-xl border border-ink/15 px-4 py-3 font-sans text-ink"
                />
              </View>

              <View>
                <Text className="mb-1 text-right font-sans text-sm text-ink/70">תמונה</Text>
                <Pressable
                  onPress={handlePickImage}
                  className="items-center rounded-xl border border-dashed border-ink/20 px-4 py-3"
                >
                  <Text className="font-sans text-sm text-navy">
                    {image ? 'החלפת תמונה' : 'בחירת תמונה'}
                  </Text>
                </Pressable>
                {image && (
                  <Image source={{ uri: image.uri }} className="mt-3 h-40 w-full rounded-xl" resizeMode="cover" />
                )}
              </View>
            </View>
          </View>

          {error ? <Text className="mt-6 text-center font-sans text-sm text-red-600">{error}</Text> : null}

          <View className="mt-8">
            <Text className="mb-3 text-right font-sans text-sm font-bold text-ink">3. אישור פרסום</Text>
            <PillButton variant="primary" className="w-full" onPress={handleSubmit} loading={isSubmitting}>
              {isSubmitting ? 'מפרסמת...' : 'פרסמו את המודעה'}
            </PillButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
