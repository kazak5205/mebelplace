// Navigation types для React Navigation
import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// Root Stack Params
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
};

// Auth Stack Params
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Video Stack Params
export type VideoStackParamList = {
  TikTokPlayer: undefined;
  Camera: undefined;
  MediaSelection: undefined;
};

// Search Stack Params
export type SearchStackParamList = {
  SearchList: undefined;
  MasterChannel: { masterId: string };
};

// Order Stack Params
export type OrderStackParamList = {
  OrdersList: undefined;
  OrderDetails: { orderId: string };
  CreateOrder: undefined;
  OrderRespond: { orderId: string };
};

// Message Stack Params
export type MessageStackParamList = {
  MessagesList: undefined;
  Chat: { chatId: string };
};

// Profile Stack Params
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Help: undefined;
};

// Main Tabs Params
export type MainTabsParamList = {
  Видео: undefined;
  Поиск: undefined;
  Заявки: undefined;
  Чат: undefined;
  Профиль: undefined;
};

// Screen props types
export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'Видео'>,
  StackScreenProps<RootStackParamList>
>;

export type SearchScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'Поиск'>,
  StackScreenProps<RootStackParamList>
>;

export type OrdersScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'Заявки'>,
  StackScreenProps<RootStackParamList>
>;

export type MessagesScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'Чат'>,
  StackScreenProps<RootStackParamList>
>;

export type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'Профиль'>,
  StackScreenProps<RootStackParamList>
>;

