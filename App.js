import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { COLORS } from './src/theme';
import PrayerScreen from './src/screens/PrayerScreen';
import AzkarScreen from './src/screens/AzkarScreen';
import QiblaScreen from './src/screens/QiblaScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Tab = createBottomTabNavigator();

export default function App() {
  const responseListener = useRef();

  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    });
    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: COLORS.accent,
          background: COLORS.bg,
          card: COLORS.card,
          text: COLORS.text,
          border: 'rgba(79,195,247,0.1)',
          notification: COLORS.accent,
        },
      }}
    >
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Намаз') iconName = focused ? 'moon' : 'moon-outline';
            else if (route.name === 'Азкары') iconName = focused ? 'book' : 'book-outline';
            else if (route.name === 'Кибла') iconName = focused ? 'compass' : 'compass-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.textDim,
          tabBarStyle: {
            backgroundColor: COLORS.card,
            borderTopColor: 'rgba(79,195,247,0.1)',
            borderTopWidth: 1,
            paddingBottom: 4,
            height: 56,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
          headerStyle: { backgroundColor: COLORS.card, shadowColor: 'transparent', elevation: 0 },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: '600' },
        })}
      >
        <Tab.Screen name="Намаз" component={PrayerScreen} />
        <Tab.Screen name="Азкары" component={AzkarScreen} />
        <Tab.Screen name="Кибла" component={QiblaScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
