import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Browse: { category?: string; q?: string } | undefined;
  Publish: undefined;
  MyListings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Login: undefined;
  Register: undefined;
  Inquiries: undefined;
};

declare module '@react-navigation/native' {
  interface RootParamList {
    MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
    Login: undefined;
    Register: undefined;
    Inquiries: undefined;
  }
}
