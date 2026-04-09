import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { MyCardsScreen } from './src/screens/MyCardsScreen';
import { AddCardScreen } from './src/screens/AddCardScreen';
import { useCardStore } from './src/store/useCardStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CardsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0D1117' },
        headerTintColor: '#FFFFFF',
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="MyCards" component={MyCardsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddCard" component={AddCardScreen} options={{ title: 'Add Custom Card' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const loadCards = useCardStore((s) => s.loadCards);

  useEffect(() => {
    loadCards();
  }, []);

  return (
    <NavigationContainer theme={DarkTheme}>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0D1117',
            borderTopColor: '#161B24',
            borderTopWidth: 1,
            paddingTop: 6,
            height: 60,
          },
          tabBarActiveTintColor: '#4361EE',
          tabBarInactiveTintColor: '#3A4A66',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Best Card',
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>💳</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Cards"
          component={CardsStack}
          options={{
            title: 'My Cards',
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>🗂️</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
