import { adService } from '@/src/services/entrepreneur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Platform,
  RefreshControl, ScrollView, StyleSheet,
  Text, TouchableOpacity,
  useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE = 375;
// const API_BASE_URL = 'http://192.168.0.195:5000';
const CATS = ['all','food','fashion','technology','education','health','beauty','sports','services','other'];

const catColor = (cat: string) => {
  const map: Record<string, string> = {
    food: '#FF6B35', fashion: '#E91E8C', technology: '#2D60FF',
    education: '#9C27B0', health: '#4CAF50', beauty: '#FF9800',
    sports: '#00BCD4', services: '#607D8B',
  };
  return map[cat] || '#607D8B';
};

export default function AdFeedScreen() {
  const insets    = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = (n: number) => Math.min((width / BASE) * n, n * 1.4);
  const [activeCat, setActiveCat] = useState('all');

  const [ads, setAds]           = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);

  // ✅ সব approved ads fetch করা (category filter সহ)
  // const fetchAds = async (isRefresh = false) => {
  //   try {
  //     isRefresh ? setIsRefetching(true) : setIsLoading(true);
  //     const params = new URLSearchParams();
  //     if (activeCat !== 'all') params.append('category', activeCat);
  //     params.append('limit', '20');

  //     const res = await fetch(`${API_BASE_URL}/api/v1/entrepreneur/ads?${params.toString()}`);
  //     const data = await res.json();
  //     if (data.success) setAds(data.data || []);
  //   } catch (err) {
  //     console.error('fetchAds error:', err);
  //   } finally {
  //     isRefresh ? setIsRefetching(false) : setIsLoading(false);
  //   }
  // };

  const fetchAds = async (isRefresh = false) => {
  try {
    isRefresh ? setIsRefetching(true) : setIsLoading(true);

    const data = await adService.getApproved({
      category: activeCat === 'all' ? undefined : activeCat,
      limit: 20,
    });

    if (data.success) {
      setAds(data.data || []);
    }
  } catch (err) {
    console.error('fetchAds:', err);
  } finally {
    isRefresh ? setIsRefetching(false) : setIsLoading(false);
  }
};

  // ✅ Featured ads fetch করা
  // const fetchFeatured = async () => {
  //   try {
  //     const res = await fetch(`${API_BASE_URL}/api/v1/entrepreneur/ads?featured=true&limit=5`);
  //     const data = await res.json();
  //     if (data.success) setFeatured(data.data || []);
  //   } catch (err) {
  //     console.error('fetchFeatured error:', err);
  //   }
  // };
  const fetchFeatured = async () => {
  try {
    const data = await adService.getApproved({
      featured: true,
      limit: 5,
    });

    if (data.success) {
      setFeatured(data.data || []);
    }
  } catch (err) {
    console.error('fetchFeatured:', err);
  }
};

  // ✅ category বদলালেই আবার fetch করুন
  useEffect(() => {
    fetchAds();
  }, [activeCat]);

  // ✅ mount হওয়ার সময় একবার featured নিয়ে আসুন
  useEffect(() => {
    fetchFeatured();
  }, []);

  // ✅ Ad ক্লিক ট্র্যাক করার ফাংশন (আগে mutation ছিল)
  // const trackClick = async ({ id, type }: { id: string; type: string }) => {
  //   try {
  //     const token = await AsyncStorage.getItem('userToken');
  //     await fetch(`${API_BASE_URL}/api/v1/entrepreneur/ads/${id}/click`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ type }),
  //     });
  //   } catch (err) {
  //     console.error('trackClick error:', err);
  //   }
  // };
const trackClick = async ({
  id,
  type,
}: {
  id: string;
  type: 'call' | 'whatsapp' | 'share';
}) => {
  try {
    await adService.trackClick(id, type);
  } catch (err) {
    console.error('trackClick:', err);
  }
};
  const AdCard = ({ item }: { item: any }) => {
    const color = catColor(item.business?.category);
    return (
      <TouchableOpacity
        style={[styles.adCard, { borderRadius: s(14) }]}
        onPress={() => router.push(`/(tabs)/entrepreneur/student/ads/${item._id}` as any)}
        activeOpacity={0.85}
      >
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={s(10)} color="#fff" />
            <Text style={[styles.featuredText, { fontSize: s(10) }]}>Featured</Text>
          </View>
        )}
        <View style={styles.adCardTop}>
          <View style={[styles.adIcon, { width: s(48), height: s(48), borderRadius: s(12), backgroundColor: color + '18' }]}>
            <Ionicons name="storefront" size={s(22)} color={color} />
          </View>
          <View style={{ flex: 1, marginLeft: s(12) }}>
            <Text style={[styles.adTitle, { fontSize: s(14) }]} numberOfLines={1}>{item.title}</Text>
            <View style={styles.adMeta}>
              <Text style={[styles.adBiz, { fontSize: s(12) }]} numberOfLines={1}>{item.business?.name}</Text>
              {item.business?.isVerified && <Ionicons name="checkmark-circle" size={s(13)} color="#2D60FF" />}
            </View>
            <View style={[styles.catBadge, { backgroundColor: color + '15' }]}>
              <Text style={[styles.catText, { color, fontSize: s(10) }]}>{item.business?.category}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={s(16)} color="#ccc" />
        </View>

        {item.shortDescription ? (
          <Text style={[styles.adDesc, { fontSize: s(12) }]} numberOfLines={2}>{item.shortDescription}</Text>
        ) : null}

        <View style={styles.adFooter}>
          <View style={styles.adStat}>
            <Ionicons name="eye-outline" size={s(12)} color="#aaa" />
            <Text style={[styles.adStatText, { fontSize: s(11) }]}>{item.views}</Text>
          </View>
          {item.business?.averageRating > 0 && (
            <View style={styles.adStat}>
              <Ionicons name="star" size={s(12)} color="#FFB800" />
              <Text style={[styles.adStatText, { fontSize: s(11) }]}>{item.business.averageRating}</Text>
            </View>
          )}
          <View style={styles.adActions}>
            {item.business?.contact?.phone && (
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#E8F5E9' }]}
                onPress={() => trackClick({ id: item._id, type: 'call' })}>
                <Ionicons name="call" size={s(13)} color="#4CAF50" />
              </TouchableOpacity>
            )}
            {item.business?.contact?.whatsapp && (
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#E8F5E9' }]}
                onPress={() => trackClick({ id: item._id, type: 'whatsapp' })}>
                <Ionicons name="logo-whatsapp" size={s(13)} color="#25D366" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#EEF2FF' }]}
              onPress={() => trackClick({ id: item._id, type: 'share' })}>
              <Ionicons name="share-social-outline" size={s(13)} color="#2D60FF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ marginBottom: s(14) }} contentContainerStyle={{ gap: 8 }}>
        {CATS.map((cat) => (
          <TouchableOpacity key={cat}
            style={[styles.catChip, activeCat === cat && styles.catChipActive]}
            onPress={() => setActiveCat(cat)}>
            <Text style={[styles.catChipText, { fontSize: s(12), color: activeCat === cat ? '#fff' : '#555' }]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {featured.length > 0 && (
        <View style={{ marginBottom: s(16) }}>
          <Text style={[styles.sectionTitle, { fontSize: s(14), marginBottom: s(10) }]}>⭐ Featured</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {featured.map((item: any) => (
              <TouchableOpacity key={item._id}
                style={[styles.featCard, { width: s(150), borderRadius: s(12) }]}
                onPress={() => router.push(`/(tabs)/entrepreneur/student/ads/${item._id}` as any)}>
                <View style={[styles.featIcon, { backgroundColor: catColor(item.business?.category) + '18', borderRadius: s(10) }]}>
                  <Ionicons name="storefront" size={s(26)} color={catColor(item.business?.category)} />
                </View>
                <Text style={[styles.featTitle, { fontSize: s(12) }]} numberOfLines={2}>{item.title}</Text>
                <Text style={[styles.featBiz,   { fontSize: s(11) }]} numberOfLines={1}>{item.business?.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      <Text style={[styles.sectionTitle, { fontSize: s(14), marginBottom: s(10) }]}>All Ads</Text>
    </View>
  );

  if (isLoading) return (
    <View style={styles.container}>
      <View style={styles.centered}><ActivityIndicator size="large" color="#2D60FF" /></View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={ads}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <AdCard item={item} />}
        ListHeaderComponent={<ListHeader />}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="megaphone-outline" size={48} color="#ddd" />
            <Text style={styles.emptyText}>No ads found</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => fetchAds(true)} colors={['#2D60FF']} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#F3F5F7' },
  list:          { padding: 16 },
  centered:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  emptyText:     { color: '#aaa', fontSize: 14 },
  sectionTitle:  { fontWeight: '700', color: '#1A1A2E' },
  catChip:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F3F4F6' },
  catChipActive: { backgroundColor: '#2D60FF' },
  catChipText:   { fontWeight: '600' },
  featCard:      { backgroundColor: '#fff', padding: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  featIcon:      { padding: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  featTitle:     { fontWeight: '700', color: '#1A1A2E', lineHeight: 17, marginBottom: 3 },
  featBiz:       { color: '#aaa' },
  adCard: {
    backgroundColor: '#fff', padding: 14,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  featuredBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FFB800', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginBottom: 8 },
  featuredText:  { color: '#fff', fontWeight: '700' },
  adCardTop:     { flexDirection: 'row', alignItems: 'center' },
  adIcon:        { alignItems: 'center', justifyContent: 'center' },
  adTitle:       { fontWeight: '700', color: '#1A1A2E' },
  adMeta:        { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  adBiz:         { color: '#666', flex: 1 },
  catBadge:      { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, alignSelf: 'flex-start', marginTop: 4 },
  catText:       { fontWeight: '600', textTransform: 'capitalize' },
  adDesc:        { color: '#666', marginTop: 8, lineHeight: 18 },
  adFooter:      { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 },
  adStat:        { flexDirection: 'row', alignItems: 'center', gap: 3 },
  adStatText:    { color: '#aaa' },
  adActions:     { flexDirection: 'row', gap: 6, marginLeft: 'auto' },
  quickBtn:      { padding: 7, borderRadius: 8 },
});