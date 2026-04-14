import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { MyCardsScreen } from './src/screens/MyCardsScreen';
import { AddCardScreen } from './src/screens/AddCardScreen';
import { BrowseCardsScreen } from './src/screens/BrowseCardsScreen';
import { BenefitsScreen } from './src/screens/BenefitsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { useCardStore } from './src/store/useCardStore';
import { useProfileStore } from './src/store/useProfileStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HEADER_OPTS = {
  headerStyle: { backgroundColor: '#0D1117' },
  headerTintColor: '#FFFFFF',
  headerShadowVisible: false,
  headerTitleStyle: { fontWeight: '700' as const },
};

function CardsStack() {
  return (
    <Stack.Navigator screenOptions={HEADER_OPTS}>
      <Stack.Screen name="MyCards" component={MyCardsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BrowseCards" component={BrowseCardsScreen} options={{ title: 'Browse Cards' }} />
      <Stack.Screen name="AddCard" component={AddCardScreen} options={{ title: 'Add Custom Card' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const loadCards = useCardStore((s) => s.loadCards);
  const initProfile = useProfileStore((s) => s.init);

  useEffect(() => {
    initProfile();
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
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Best Card',
            tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>💳</Text>,
          }}
        />
        <Tab.Screen
          name="Benefits"
          component={BenefitsScreen}
          options={{
            title: 'Benefits',
            tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>🎁</Text>,
          }}
        />
        <Tab.Screen
          name="Cards"
          component={CardsStack}
          options={{
            title: 'My Cards',
            tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>🗂️</Text>,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>⚙️</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
