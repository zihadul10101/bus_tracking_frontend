import { adService } from '@/src/services/entrepreneur';
import { getErrorMessage } from '@/src/utils/errorHandler';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Platform,
  RefreshControl, ScrollView, StyleSheet, Text,
  TouchableOpacity, useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE     = 375;

const STATUSES = ['all', 'pending', 'approved', 'rejected', 'hidden', 'expired'];

const statusColor = (s: string) => {
  switch (s) {
    case 'approved': return { bg: '#E8F5E9', text: '#2E7D32' };
    case 'pending':  return { bg: '#FFF8E1', text: '#F57F17' };
    case 'rejected': return { bg: '#FFEBEE', text: '#C62828' };
    case 'hidden':   return { bg: '#F3F4F6', text: '#4B5563' };
    case 'expired':  return { bg: '#EDE9FE', text: '#6D28D9' };
    default:         return { bg: '#EEF2FF', text: '#2D60FF' };
  }
};

export default function AdminAdsScreen() {
  const insets    = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = (n: number) => Math.min((width / BASE) * n, n * 1.4);
  const { status: initStatus } = useLocalSearchParams<{ status?: string }>();
  const [filter, setFilter]    = useState(initStatus || 'all');

  const [ads, setAds] = useState<any[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);

  // ✅ সব ads fetch করা (status filter সহ)

const fetchAds = async (isRefresh = false) => {
  try {
    isRefresh ? setIsRefetching(true) : setIsLoading(true);

    const response = await adService.adminGetAll(
      filter === 'all'
        ? undefined
        : {
            status: filter,
          }
    );

    if (response.success) {
      setAds(response.data ?? []);
    }
  } catch (error) {
    Alert.alert(
      'Error',
      getErrorMessage(error)
    );
  } finally {
    setIsLoading(false);
    setIsRefetching(false);
  }
};
  // ✅ filter বদলালেই আবার fetch করুন
  useEffect(() => {
    fetchAds();
  }, [filter]);



  const updateAd = async (
  id: string,
  payload: any
) => {
  try {
    await adService.adminUpdateStatus(id, payload);

    Alert.alert(
      'Success',
      'Advertisement updated successfully.'
    );

    fetchAds(true);
  } catch (error) {
    Alert.alert(
      'Error',
      getErrorMessage(error)
    );
  }
};

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const AdCard = ({ item }: { item: any }) => {
    const sc = statusColor(item.status);
    return (
      <View style={[styles.card, { borderRadius: s(14) }]}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.adTitle, { fontSize: s(14) }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.adSub,   { fontSize: s(12) }]}>{item.business?.name} · {item.owner?.name}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.badgeText, { color: sc.text, fontSize: s(11) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}><Ionicons name="eye-outline"      size={s(12)} color="#aaa" /><Text style={[styles.metaText, { fontSize: s(11) }]}>{item.views}</Text></View>
          <View style={styles.metaItem}><Ionicons name="calendar-outline" size={s(12)} color="#aaa" /><Text style={[styles.metaText, { fontSize: s(11) }]}>{item.durationDays}d</Text></View>
          <View style={styles.metaItem}><Ionicons name="card-outline"     size={s(12)} color="#aaa" /><Text style={[styles.metaText, { fontSize: s(11) }]}>{item.payment?.isFree ? 'Free' : `৳${item.payment?.finalAmount}`}</Text></View>
          {item.isFeatured && <View style={styles.metaItem}><Ionicons name="star" size={s(12)} color="#FFB800" /><Text style={[styles.metaText, { fontSize: s(11), color: '#FFB800' }]}>Featured</Text></View>}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EEF2FF' }]}
            onPress={() => router.push(`/(tabs)/entrepreneur/admin/ads/${item._id}` as any)}>
            <Ionicons name="eye-outline" size={s(13)} color="#2D60FF" />
            <Text style={[styles.actionText, { color: '#2D60FF', fontSize: s(12) }]}>Detail</Text>
          </TouchableOpacity>

          {item.status === 'pending' && (
            <>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E8F5E9' }]}
                onPress={() => updateAd(item._id, { status: 'approved' })}>
                <Ionicons name="checkmark" size={s(13)} color="#2E7D32" />
                <Text style={[styles.actionText, { color: '#2E7D32', fontSize: s(12) }]}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFEBEE' }]}
                onPress={() => Alert.alert('Reject', 'Reject this ad?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reject', style: 'destructive', onPress: () => updateAd(item._id, { status: 'rejected', rejectionReason: 'Does not meet guidelines.' }) },
                ])}>
                <Ionicons name="close" size={s(13)} color="#C62828" />
                <Text style={[styles.actionText, { color: '#C62828', fontSize: s(12) }]}>Reject</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'approved' && (
            <>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFF3E0' }]}
                onPress={() => updateAd(item._id, { isFeatured: !item.isFeatured })}>
                <Ionicons name="star-outline" size={s(13)} color="#E65100" />
                <Text style={[styles.actionText, { color: '#E65100', fontSize: s(12) }]}>{item.isFeatured ? 'Unfeature' : 'Feature'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F3F4F6' }]}
                onPress={() => updateAd(item._id, { status: 'hidden' })}>
                <Ionicons name="eye-off-outline" size={s(13)} color="#4B5563" />
                <Text style={[styles.actionText, { color: '#4B5563', fontSize: s(12) }]}>Hide</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'hidden' && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E8F5E9' }]}
              onPress={() => updateAd(item._id, { status: 'approved' })}>
              <Ionicons name="eye-outline" size={s(13)} color="#2E7D32" />
              <Text style={[styles.actionText, { color: '#2E7D32', fontSize: s(12) }]}>Unhide</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {STATUSES.map((st) => (
          <TouchableOpacity key={st}
            style={[styles.filterChip, filter === st && styles.filterChipActive]}
            onPress={() => setFilter(st)}>
            <Text style={[styles.filterText, { fontSize: s(12) }, filter === st && styles.filterTextActive]}>
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#2D60FF" /></View>
      ) : (
        <FlatList
          data={ads}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <AdCard item={item} />}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="megaphone-outline" size={48} color="#ddd" />
              <Text style={styles.emptyText}>No ads found</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => fetchAds(true)} colors={['#2D60FF']} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F3F5F7' },
  list:             { padding: 16 },
  centered:         { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  emptyText:        { color: '#aaa', fontSize: 14 },
  filterRow:        { paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  filterChip:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F3F4F6' },
  filterChipActive: { backgroundColor: '#2D60FF' },
  filterText:       { fontWeight: '600', color: '#555' },
  filterTextActive: { color: '#fff' },
  card:             { backgroundColor: '#fff', padding: 14, ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 }, android: { elevation: 2 } }) },
  cardTop:          { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  adTitle:          { fontWeight: '700', color: '#1A1A2E' },
  adSub:            { color: '#888', marginTop: 2 },
  badge:            { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
  badgeText:        { fontWeight: '600' },
  metaRow:          { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  metaItem:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:         { color: '#aaa' },
  actions:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  actionText:       { fontWeight: '600' },
});