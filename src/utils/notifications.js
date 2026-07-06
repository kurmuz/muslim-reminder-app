import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Напоминания',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function schedulePrayerNotification(prayerName, timeDate) {
  const id = `prayer-${prayerName}-${timeDate.toISOString().slice(0, 10)}`;
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: `🕌 Время намаза: ${prayerName}`,
      body: 'Наступило время молитвы',
      sound: 'default',
      priority: Notifications.AndroidImportance.HIGH,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: timeDate,
    },
  });
}

export async function scheduleReminderNotification(timeDate) {
  const id = `reminder-${Date.now()}`;
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: '⏰ Время делать зикр',
      body: 'Напоминание о зикре',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: timeDate,
    },
  });
  return id;
}

export async function cancelNotification(id) {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllPrayerNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.identifier.startsWith('prayer-')) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}
