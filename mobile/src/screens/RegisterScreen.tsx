import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import useUsersStore from '../store/usersStore';
import FormField from '../components/FormField';
import PillButton from '../components/PillButton';
import type { RootStackParamList } from '../navigation/types';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
};

export default function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const register = useUsersStore((state) => state.register);
  const isLoading = useUsersStore((state) => state.isLoading);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      await register(form);
      navigation.navigate('Login');
    } catch (err) {
      const message =
        axios.isAxiosError(err) && (err.response?.data as { error?: string } | undefined)?.error
          ? (err.response!.data as { error: string }).error
          : 'משהו השתבש. נסו שוב.';
      setError(message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="px-6 py-16" keyboardShouldPersistTaps="handled">
          <Text className="text-center font-display text-3xl font-extrabold text-ink">הרשמה</Text>

          <View className="mt-8 flex flex-col gap-4">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <FormField label="שם פרטי" value={form.firstName} onChange={updateField('firstName')} />
              </View>
              <View className="flex-1">
                <FormField label="שם משפחה" value={form.lastName} onChange={updateField('lastName')} />
              </View>
            </View>
            <FormField
              label="אימייל"
              keyboardType="email-address"
              value={form.email}
              onChange={updateField('email')}
            />
            <FormField
              label="טלפון"
              keyboardType="phone-pad"
              placeholder="05XXXXXXXX"
              value={form.phone}
              onChange={updateField('phone')}
            />
            <FormField label="סיסמה" secureTextEntry value={form.password} onChange={updateField('password')} />

            {error ? <Text className="text-center font-sans text-sm text-red-600">{error}</Text> : null}

            <PillButton variant="primary" className="mt-2 w-full" onPress={handleSubmit} loading={isLoading}>
              {isLoading ? 'נרשמים…' : 'הרשמה'}
            </PillButton>
          </View>

          <View className="mt-6 flex-row items-center justify-center gap-1">
            <Text className="font-sans text-sm text-ink/60">כבר יש לכם חשבון?</Text>
            <Text
              onPress={() => navigation.navigate('Login')}
              className="font-sans text-sm font-semibold text-ink underline"
            >
              התחברות
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
