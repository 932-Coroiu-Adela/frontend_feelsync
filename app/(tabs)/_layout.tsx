import { Stack, Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Toast from 'react-native-toast-message';
import { ChatScreen } from '@/components/ChatScreen';

export default function TabLayout() {
  //const colorScheme = useColorScheme();

  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }}/>
      <Stack.Screen name='login' options={{ headerShown: false }}/>
      <Stack.Screen name='signup' options={{ headerShown: false }}/>
      <Stack.Screen name='home' options={{ headerShown: false }}/>
      <Stack.Screen name='events' options={{ headerShown: false }}/>
      <Stack.Screen name='friends' options={{ headerShown: false }}/>
      <Stack.Screen name='chatbot' options={{ headerShown: false }}/>
      <Stack.Screen name='profile' options={{ headerShown: false }}/>
      <Stack.Screen name='add_event' options={{ headerShown: false }}/>
      <Stack.Screen name='chat' options={{ headerShown: false }}/>
      <Toast/>
    </Stack>
  );
}
