import { usePackages } from '@/hooks/entrepreneur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator, FlatList, Platform,
    RefreshControl, StyleSheet, Text,
    TouchableOpacity, useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE = 375;

const durationColor = (days: number) => {
  if (days === 7)  return { bg: '#E8F5E9', text: '#2E7D32', accent: '#4CAF50' };
  if (days === 15) return { bg: '#EEF2FF', text: '#3852C8', accent: '#2D60FF' };
  if (days === 30) return { bg: '#FFF3E0', text: '#E65100', accent: '#FF9800' };
  return             { bg: '#F3F4F6', text: '#4B5563', accent: '#9CA3AF' };
};

export default function PackagesScreen() {
  const insets    = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = (n: number) => Math.min((width / BASE) * n, n * 1.4);

  const { data: packages = [], isLoading, refetch, isRefetching } = usePackages();

  const PackageCard = ({ item }: { item: any }) => {
    const dc = durationColor(item.durationDays);
    return (
      <View style={[styles.card, { borderRadius: s(16) }]}>
        <View style={[styles.cardHeader, { backgroundColor: dc.accent, borderRadius: s(12) }]}>
          <View>
            <Text style={[styles.pkgName,     { fontSize: s(16) }]}>{item.name}</Text>
            <Text style={[styles.pkgDuration, { fontSize: s(12) }]}>
              {item.durationDays} days listing
            </Text>
          </View>
          <View style={[styles.priceBox, { borderRadius: s(10) }]}>
            <Text style={[styles.priceText, { fontSize: s(22) }]}>
              {item.isFree ? 'FREE' : `৳${item.price}`}
            </Text>
          </View>
        </View>

        {item.description ? (
          <Text style={[styles.pkgDesc, { fontSize: s(12) }]}>{item.description}</Text>
        ) : null}

        {item.features?.length > 0 && (
          <View style={styles.features}>
            {item.features.map((f: string, i: number) => (
              <View key={i} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={s(14)} color={dc.accent} />
                <Text style={[styles.featureText, { fontSize: s(13) }]}>{f}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: dc.accent, borderRadius: s(12) }]}
          onPress={() => router.push('/(tabs)/entrepreneur/student/ads/submit' as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="megaphone-outline" size={s(16)} color="#fff" />
          <Text style={[styles.ctaText, { fontSize: s(14) }]}>
            Submit Ad with this Package
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) return (
    <View style={styles.container}>
      {/* <CommonHeader title="Packages" showBackButton onBackPress={() => router.back()} /> */}
      <View style={styles.centered}><ActivityIndicator size="large" color="#2D60FF" /></View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* <CommonHeader title="Packages" showBackButton onBackPress={() => router.back()} /> */}
      <FlatList
        data={packages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <PackageCard item={item} />}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={() => (
          <View style={[styles.banner, { borderRadius: s(14), marginBottom: s(16) }]}>
            <Ionicons name="cube-outline" size={s(28)} color="#2D60FF" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { fontSize: s(14) }]}>Choose the right plan</Text>
              <Text style={[styles.bannerSub,   { fontSize: s(12) }]}>
                Post your business ad and reach thousands of students
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="cube-outline" size={48} color="#ddd" />
            <Text style={styles.emptyText}>No packages available</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#2D60FF']} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F3F5F7' },
  list:        { padding: 16 },
  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  emptyText:   { color: '#aaa', fontSize: 14 },
  banner:      { backgroundColor: '#EEF2FF', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#C7D2FE' },
  bannerTitle: { fontWeight: '700', color: '#1A1A2E' },
  bannerSub:   { color: '#666', marginTop: 3, lineHeight: 18 },
  card: {
    backgroundColor: '#fff', overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.07, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  cardHeader:  { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 12, marginBottom: 0 },
  pkgName:     { color: '#fff', fontWeight: '800' },
  pkgDuration: { color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  priceBox:    { backgroundColor: 'rgba(255,255,255,0.25)', padding: 10 },
  priceText:   { color: '#fff', fontWeight: '800' },
  pkgDesc:     { color: '#666', padding: 14, paddingBottom: 0, lineHeight: 18 },
  features:    { padding: 14, paddingBottom: 0, gap: 8 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { color: '#374151' },
  ctaBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 14, paddingVertical: 12 },
  ctaText:     { color: '#fff', fontWeight: '700' },
});