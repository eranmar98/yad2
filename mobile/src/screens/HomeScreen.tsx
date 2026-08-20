import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SearchBar from '../components/SearchBar';
import CategoryCards from '../components/CategoryCards';
import HowItWorks from '../components/HowItWorks';
import HotListings from '../components/HotListings';
import Logo from '../components/Logo';
import useUsersStore from '../store/usersStore';
import type { RootStackParamList } from '../navigation/types';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const token = useUsersStore((state) => state.token);
  const user = useUsersStore((state) => state.user);
  const logout = useUsersStore((state) => state.logout);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-6 py-3">
        <Logo />
        {token ? (
          <Text onPress={logout} className="font-sans text-xs text-ink/50">
            מחובר{user?.firstName ? ` (${user.firstName})` : ''} · התנתקות
          </Text>
        ) : (
          <Text onPress={() => navigation.navigate('Login')} className="font-sans text-sm font-bold text-navy">
            התחברות
          </Text>
        )}
      </View>

      <ScrollView contentContainerClassName="pb-16">
        <View className="bg-sky-50 px-6 pb-10 pt-6">
          <SearchBar />

          <Text className="mt-8 text-center font-display text-3xl font-extrabold leading-tight text-ink">
            הכירו את <Text className="text-navy">Pickit</Text>.{'\n'}המארקט החדש של ישראל.
          </Text>

          <Text className="mt-5 text-center font-sans text-base text-ink/60">
            קונים, מוכרים ומדברים — הכול במקום אחד.{'\n'}
            מוצרים, רכבים ונדל״ן, חדשים ויד שנייה, ישירות מהאנשים שמוכרים אותם.
          </Text>

          <CategoryCards />
        </View>

        <HowItWorks />
        <HotListings />
      </ScrollView>
    </SafeAreaView>
  );
}
