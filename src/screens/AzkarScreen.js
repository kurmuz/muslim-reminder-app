import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';
import { AZKAR } from '../data/azkar';

const CATEGORIES = [
  { key: 'afterPrayer', label: 'После намаза' },
  { key: 'morning', label: 'Утренние' },
  { key: 'evening', label: 'Вечерние' },
];

function AzkarItem({ item }) {
  const text = item.arabic.includes('\n')
    ? item.arabic.split('\n').map((line, i) => (
        <Text key={i} style={styles.arabicLine}>{line}</Text>
      ))
    : <Text style={styles.arabicLine}>{item.arabic}</Text>;

  return (
    <View style={styles.item}>
      <View style={styles.arabicWrap}>{text}</View>
      <Text style={styles.transliteration}>{item.transliteration}</Text>
      <Text style={styles.russian}>{item.russian}</Text>
      {item.count > 1 && (
        <Text style={styles.count}>Повторить: {item.count} раз</Text>
      )}
    </View>
  );
}

export default function AzkarScreen() {
  const [cat, setCat] = useState('afterPrayer');
  const items = AZKAR[cat] || [];

  return (
    <View style={styles.container}>
      <ScrollView horizontal style={styles.tabs} showsHorizontalScrollIndicator={false}>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c.key}
            style={[styles.tab, cat === c.key && styles.tabActive]}
            onPress={() => setCat(c.key)}
          >
            <Text style={[styles.tabText, cat === c.key && styles.tabTextActive]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {items.map((item, i) => (
          <AzkarItem key={i} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  tabs: { flexGrow: 0, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.bg },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 6, backgroundColor: COLORS.card, borderWidth: 1, borderColor: 'rgba(79,195,247,0.15)' },
  tabActive: { backgroundColor: COLORS.accentDim, borderColor: COLORS.accent },
  tabText: { fontSize: 13, color: COLORS.textDim, fontWeight: '500' },
  tabTextActive: { color: COLORS.accent },
  list: { flex: 1 },
  listContent: { padding: 12, paddingBottom: 30 },
  item: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 8 },
  arabicWrap: { marginBottom: 6 },
  arabicLine: { fontSize: 21, lineHeight: 42, textAlign: 'right', color: COLORS.gold, writingDirection: 'rtl' },
  transliteration: { fontSize: 13, color: COLORS.accent, fontStyle: 'italic', marginBottom: 4, lineHeight: 18 },
  russian: { fontSize: 13, color: COLORS.textDim, lineHeight: 20 },
  count: { fontSize: 12, color: COLORS.textDim, marginTop: 4, fontStyle: 'italic' },
});
