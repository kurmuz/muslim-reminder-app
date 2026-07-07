import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

function ErrorFallback({ error, reset }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0D1B2A', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ color: '#E53935', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Ошибка</Text>
      <Text style={{ color: '#90CAF9', fontSize: 13, textAlign: 'center' }}>{error?.message || 'Неизвестная ошибка'}</Text>
      <TouchableOpacity onPress={reset} style={{ marginTop: 16, backgroundColor: '#1B3A5C', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}>
        <Text style={{ color: '#4FC3F7', fontWeight: '600' }}>Перезапустить</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  const [crash, setCrash] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const responseListener = useRef();

  useEffect(() => {
    const prevHandler = global.ErrorUtils?.getGlobalHandler && global.ErrorUtils.getGlobalHandler();
    if (global.ErrorUtils?.setGlobalHandler) {
      global.ErrorUtils.setGlobalHandler((e, isFatal) => {
        setCrash({ message: e?.message || String(e), isFatal });
      });
    }
    return () => {
      if (prevHandler && global.ErrorUtils?.setGlobalHandler) {
        global.ErrorUtils.setGlobalHandler(prevHandler);
      }
    };
  }, []);

  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    });
    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  if (crash) {
    return <ErrorFallback error={crash} reset={() => { setCrash(null); setRetryKey(k => k + 1); }} />;
  }

  try {
    return (
      <NavigationContainer key={retryKey}
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
  } catch (e) {
    return <ErrorFallback error={e} reset={() => setRetryKey(k => k + 1)} />;
  }
}
