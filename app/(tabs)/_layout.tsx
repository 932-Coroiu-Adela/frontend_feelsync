import { Stack } from 'expo-router';
import React from 'react';


export default function TabLayout() {

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
      </Stack>
    
  );
}
