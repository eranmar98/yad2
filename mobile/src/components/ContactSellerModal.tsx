import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import axios from 'axios';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import InquiriesServices from '../services/inquiriesServices';
import useUsersStore from '../store/usersStore';
import PillButton from './PillButton';
import type { Item } from '../services/itemsServices';
import type { RootStackParamList } from '../navigation/types';

type ContactSellerButtonProps = {
  item: Item;
  className?: string;
};

export default function ContactSellerButton({ item, className = '' }: ContactSellerButtonProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const token = useUsersStore((state) => state.token);
  const user = useUsersStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const isOwnItem = Boolean(user && item.sellerId === user._id);

  if (isOwnItem) return null;

  const openModal = () => {
    if (!token) {
      navigation.navigate('Login');
      return;
    }
    setError('');
    setMessage('');
    setIsSent(false);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('יש לכתוב הודעה למוכר');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await InquiriesServices.createInquiry(item._id, message.trim());
      setIsSent(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const serverMessage = (err.response?.data as { error?: string } | undefined)?.error;
        setError(serverMessage ?? 'שליחת ההודעה נכשלה, נסו שוב');
      } else {
        setError('שליחת ההודעה נכשלה, נסו שוב');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PillButton variant="secondary" className={className} onPress={openModal}>
        צור קשר עם המוכר
      </PillButton>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={closeModal}>
        <Pressable
          onPress={closeModal}
          className="flex-1 items-center justify-center bg-ink/40 px-4"
        >
          <Pressable className="w-full max-w-md rounded-2xl bg-white p-6" onPress={(e) => e.stopPropagation()}>
            <View className="mb-4 flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-right font-display text-lg font-bold text-ink">
                  צור קשר עם המוכר
                </Text>
                <Text className="mt-1 text-right font-sans text-sm text-ink/60">
                  בנוגע ל: {item.title}
                </Text>
              </View>
              <Pressable onPress={closeModal} className="rounded-full p-1">
                <FontAwesome5 name="times" size={16} color="#111208" />
              </Pressable>
            </View>

            {isSent ? (
              <View className="items-center">
                <Text className="font-sans text-ink">ההודעה נשלחה בהצלחה!</Text>
                <Text className="mt-1 text-center font-sans text-sm text-ink/60">
                  המוכר יקבל את פנייתך ויוכל לחזור אליך.
                </Text>
                <PillButton variant="primary" className="mt-5 w-full" onPress={closeModal}>
                  סגירה
                </PillButton>
              </View>
            ) : (
              <View className="flex flex-col gap-4">
                <View className="flex flex-col gap-1">
                  <Text className="text-right font-sans text-sm text-ink/70">ההודעה שלך</Text>
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="שלום, אני מתעניין/ת בפריט..."
                    multiline
                    numberOfLines={4}
                    textAlign="right"
                    textAlignVertical="top"
                    className="h-28 rounded-xl border border-ink/15 px-4 py-3 font-sans text-ink"
                  />
                </View>

                {error ? <Text className="font-sans text-sm text-red-600">{error}</Text> : null}

                <PillButton variant="primary" className="w-full" onPress={handleSubmit} loading={isSubmitting}>
                  {isSubmitting ? 'שולחת...' : 'שליחת הודעה'}
                </PillButton>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
