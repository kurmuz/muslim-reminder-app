import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../theme';
import { CITIES, KAABA } from '../data/cities';

const CITY_KEY = '@selected_city';

function calcBearing(lat1, lng1, lat2, lng2) {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function dirName(bearing) {
  const dirs = ['N', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
  return dirs[Math.round(bearing / 45) % 8];
}

export default function QiblaScreen() {
  const [heading, setHeading] = useState(0);
  const [city, setCity] = useState(null);
  const [bearing, setBearing] = useState(0);
  const [dist, setDist] = useState(0);
  const [hasSensor, setHasSensor] = useState(false);
  const subscription = useRef(null);

  useEffect(() => {
    loadCity();
    return () => { if (subscription.current) subscription.current.remove(); };
  }, []);

  useEffect(() => {
    if (!city) return;
    const b = calcBearing(city.lat, city.lng, KAABA.lat, KAABA.lng);
    setBearing(b);
    setDist(calcDistance(city.lat, city.lng, KAABA.lat, KAABA.lng));
    // Start compass
    Magnetometer.isAvailableAsync().then(avail => {
      setHasSensor(avail);
      if (avail) {
        subscription.current = Magnetometer.addListener(data => {
          // Simple heading from magnetometer (assuming device flat)
          let angle = Math.atan2(data.y, data.x) * 180 / Math.PI;
          if (angle < 0) angle += 360;
          setHeading(angle);
        });
      }
    });
  }, [city]);

  const loadCity = async () => {
    try {
      const saved = await AsyncStorage.getItem(CITY_KEY);
      if (saved) {
        const idx = parseInt(saved, 10);
        setCity(CITIES[idx]);
      } else {
        setCity(CITIES[0]);
      }
    } catch (e) {
      setCity(CITIES[0]);
    }
  };

  const size = Dimensions.get('window').width * 0.65;
  const needleRotation = bearing - heading;
  const arrowRotation = heading;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Кибла</Text>
      {!hasSensor && (
        <Text style={styles.compassFallback}>
          Компас недоступен. Направление по городу:
        </Text>
      )}
      <View style={[styles.compass, { width: size, height: size }]}>
        <View style={[styles.arrow, { transform: [{ rotate: `${arrowRotation}deg` }] }]}>
          <View style={styles.arrowUp} />
          <View style={styles.arrowDown} />
        </View>
        <View style={[styles.needle, { transform: [{ rotate: `${needleRotation}deg` }] }]}>
          <View style={styles.needleUp} />
          <View style={styles.needleDown} />
        </View>
        <View style={styles.centerDot} />
        <Text style={[styles.dir, styles.north]}>N</Text>
        <Text style={[styles.dir, styles.south]}>S</Text>
        <Text style={[styles.dir, styles.east]}>E</Text>
        <Text style={[styles.dir, styles.west]}>W</Text>
      </View>
      <Text style={styles.bearingText}>
        {Math.round(bearing - heading)}° ({dirName(bearing - heading)})
      </Text>
      {city && (
        <Text style={styles.cityInfo}>
          {city.name}: {bearing}° ({dirName(bearing)}), {dist} км до Каабы
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  compassFallback: { fontSize: 13, color: COLORS.textDim, textAlign: 'center', marginBottom: 12 },
  compass: { borderRadius: 999, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(79,195,247,0.2)', position: 'relative' },
  arrow: { position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  arrowUp: { width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 40, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: COLORS.textDim, position: 'absolute', top: 10 },
  arrowDown: { width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 40, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: COLORS.textDim, position: 'absolute', bottom: 10 },
  needle: { position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  needleUp: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderBottomWidth: 50, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: COLORS.accent, position: 'absolute', top: 5 },
  needleDown: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 50, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: COLORS.gold, position: 'absolute', bottom: 5 },
  centerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.gold, zIndex: 10 },
  dir: { position: 'absolute', fontSize: 14, fontWeight: '700', color: COLORS.textDim },
  north: { top: 8 },
  south: { bottom: 8 },
  east: { right: 12 },
  west: { left: 12 },
  bearingText: { fontSize: 28, fontWeight: '700', color: COLORS.accent, marginTop: 16 },
  cityInfo: { fontSize: 13, color: COLORS.textDim, marginTop: 8, textAlign: 'center' },
});
