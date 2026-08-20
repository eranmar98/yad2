import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import useUsersStore from '../store/usersStore';
import HomeScreen from '../screens/HomeScreen';
import BrowseScreen from '../screens/BrowseScreen';
import PublishItemScreen from '../screens/PublishItemScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import InquiriesScreen from '../screens/InquiriesScreen';
import type { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const tabIcons: Record<keyof MainTabParamList, string> = {
  Home: 'home',
  Browse: 'search',
  Publish: 'plus-circle',
  MyListings: 'list-alt',
};

function MainTabs() {
  const token = useUsersStore((state) => state.token);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#152A4E',
        tabBarInactiveTintColor: '#11120866',
        tabBarIcon: ({ color, size }) => (
          <FontAwesome5 name={tabIcons[route.name]} size={size - 4} color={color} />
        ),
      })}
      screenListeners={({ navigation, route }) => ({
        tabPress: (e) => {
          const requiresAuth = route.name === 'Publish' || route.name === 'MyListings';
          if (requiresAuth && !token) {
            e.preventDefault();
            navigation.getParent<any>()?.navigate('Login');
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'בית' }} />
      <Tab.Screen name="Browse" component={BrowseScreen} options={{ title: 'מודעות' }} />
      <Tab.Screen name="Publish" component={PublishItemScreen} options={{ title: 'פרסום' }} />
      <Tab.Screen name="MyListings" component={MyListingsScreen} options={{ title: 'המודעות שלי' }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ presentation: 'modal', headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ presentation: 'modal', headerShown: false }}
      />
      <Stack.Screen
        name="Inquiries"
        component={InquiriesScreen}
        options={{ headerShown: true, title: 'פניות שקיבלתי', headerBackTitle: 'חזרה' }}
      />
    </Stack.Navigator>
  );
}
