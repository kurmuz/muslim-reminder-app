import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../theme';
import { CITIES } from '../data/cities';
import { PRAYER_LABELS, PRAYER_ICONS } from '../data/adhan';
import { calculateTimes, getNextPrayer, getCountdown } from '../utils/prayer';
import * as Location from 'expo-location';
import { findNearestCity } from '../utils/location';
import { schedulePrayerNotification, requestPermissions } from '../utils/notifications';

const CITY_KEY = '@selected_city';

function formatDate(date) {
  const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${days[date.getDay()]}`;
}

function toHijri(date) {
  const jd = Math.floor((date - new Date(date.getFullYear(), 0, 1)) / 86400000) + 1 +
    Math.floor(365.25 * (date.getFullYear() - 1)) + 1948440;
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
  const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const m = Math.floor((24 * l3) / 709);
  const d = l3 - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;
  const months_h = ['Мухаррам', 'Сафар', 'Раби-уль-Авваль', 'Раби-уль-Ахир', 'Джумада-ль-Авваль', 'Джумада-ль-Ахир', 'Раджаб', 'Шабан', 'Рамадан', 'Шавваль', 'Зуль-Када', 'Зуль-Хиджа'];
  return `${d} ${months_h[m - 1] || ''} ${y} г.х.`;
}

export default function PrayerScreen() {
  const [city, setCity] = useState(null);
  const [times, setTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [prayerTime, setPrayerTime] = useState('');

  useEffect(() => {
    loadCity();
    requestPermissions();
  }, []);

  useEffect(() => {
    if (!city) return;
    const update = () => {
      const now = new Date();
      setPrayerTime(formatDate(now));
      const t = calculateTimes(now, city);
      setTimes(t);
      const next = getNextPrayer(t);
      setNextPrayer(next);
      setCountdown(getCountdown(next));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [city]);

  const loadCity = async () => {
    try {
      const saved = await AsyncStorage.getItem(CITY_KEY);
      if (saved) {
        const idx = parseInt(saved, 10);
        setCity(CITIES[idx]);
        return;
      }
      // Auto-detect via GPS
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        const nearest = findNearestCity(loc.coords.latitude, loc.coords.longitude);
        if (nearest) {
          const idx = CITIES.indexOf(nearest);
          await AsyncStorage.setItem(CITY_KEY, String(idx));
          setCity(nearest);
        }
      }
    } catch (e) { /* silent */ }
  };

  const selectCity = async (index) => {
    await AsyncStorage.setItem(CITY_KEY, String(index));
    setCity(CITIES[index]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.date}>{prayerTime}</Text>
      {nextPrayer && (
        <View style={styles.nextPrayer}>
          <Text style={styles.nextLabel}>До {PRAYER_LABELS[nextPrayer.name]}</Text>
          <Text style={styles.countdown}>{countdown}</Text>
        </View>
      )}
      <Text style={styles.sectionTitle}>Время намаза на сегодня</Text>
      {times && Object.keys(PRAYER_LABELS).map(name => {
        const t = times[name];
        if (!t) return null;
        const isNext = nextPrayer && nextPrayer.name === name;
        return (
          <View key={name} style={[styles.prayerRow, isNext && styles.prayerNext]}>
            <Text style={styles.prayerIcon}>{PRAYER_ICONS[name]}</Text>
            <Text style={styles.prayerName}>{PRAYER_LABELS[name]}</Text>
            <Text style={styles.prayerTime}>{t.label}</Text>
          </View>
        );
      })}
      <View style={styles.cityPicker}>
        <Text style={styles.cityLabel}>Город:</Text>
        <View style={styles.cityButtons}>
          {CITIES.map((c, i) => (
            <Text
              key={i}
              style={[styles.cityBtn, city === c && styles.cityBtnActive]}
              onPress={() => selectCity(i)}
            >
              {c.name}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  date: { fontSize: 14, color: COLORS.textDim, textAlign: 'center', marginBottom: 4 },
  nextPrayer: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(79,195,247,0.15)' },
  nextLabel: { fontSize: 14, color: COLORS.textDim },
  countdown: { fontSize: 32, fontWeight: '700', color: COLORS.gold, marginTop: 4, fontVariant: ['tabular-nums'] },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  prayerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 12, marginBottom: 6 },
  prayerNext: { borderWidth: 1, borderColor: COLORS.accent },
  prayerIcon: { fontSize: 18, marginRight: 10 },
  prayerName: { flex: 1, fontSize: 15, color: COLORS.text },
  prayerTime: { fontSize: 15, color: COLORS.accent, fontWeight: '600', fontVariant: ['tabular-nums'] },
  cityPicker: { marginTop: 20 },
  cityLabel: { fontSize: 14, color: COLORS.textDim, marginBottom: 8 },
  cityButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cityBtn: { backgroundColor: COLORS.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, fontSize: 12, color: COLORS.textDim, borderWidth: 1, borderColor: 'rgba(79,195,247,0.15)', overflow: 'hidden' },
  cityBtnActive: { backgroundColor: COLORS.accentDim, borderColor: COLORS.accent, color: COLORS.accent },
});
