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

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const login = useUsersStore((state) => state.login);
  const isLoading = useUsersStore((state) => state.isLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    try {      
      await login(email, password);
      navigation.navigate('MainTabs', { screen: 'Home' });
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
          <Text className="text-center font-display text-3xl font-extrabold text-ink">התחברות</Text>

          <View className="mt-8 flex flex-col gap-4">
            <FormField label="אימייל" keyboardType="email-address" value={email} onChange={setEmail} />
            <FormField label="סיסמה" secureTextEntry value={password} onChange={setPassword} />

            {error ? <Text className="text-center font-sans text-sm text-red-600">{error}</Text> : null}

            <PillButton variant="primary" className="mt-2 w-full" onPress={handleSubmit} loading={isLoading}>
              {isLoading ? 'מתחברים…' : 'התחברות'}
            </PillButton>
          </View>

          <View className="mt-6 flex-row items-center justify-center gap-1">
            <Text className="font-sans text-sm text-ink/60">אין לכם חשבון?</Text>
            <Text
              onPress={() => navigation.navigate('Register')}
              className="font-sans text-sm font-semibold text-ink underline"
            >
              הרשמה
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
