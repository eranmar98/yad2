import './global.css';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Rubik_700Bold, Rubik_800ExtraBold, Rubik_900Black } from '@expo-google-fonts/rubik';
import { Heebo_400Regular, Heebo_500Medium, Heebo_600SemiBold, Heebo_700Bold } from '@expo-google-fonts/heebo';
import RootNavigator from './src/navigation/RootNavigator';
import useUsersStore from './src/store/usersStore';

export default function App() {
  const [fontsLoaded] = useFonts({
    Rubik_700Bold,
    Rubik_800ExtraBold,
    Rubik_900Black,
    Heebo_400Regular,
    Heebo_500Medium,
    Heebo_600SemiBold,
    Heebo_700Bold,
  });
  const hydrate = useUsersStore((state) => state.hydrate);
  const isHydrating = useUsersStore((state) => state.isHydrating);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!fontsLoaded || isHydrating) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#152A4E" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="dark" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
