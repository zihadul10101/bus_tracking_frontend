import { adService } from '@/src/services/entrepreneur';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, FlatList, Platform,
  RefreshControl, StyleSheet, Text,
  TouchableOpacity, useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const BASE = 375;
const RENEW_WINDOW_DAYS = 7; // ✅ মেয়াদ শেষ হওয়ার এই কয়দিন আগে থেকে Renew বাটন দেখাবে

const statusColor = (status: string) => {
  switch (status) {
    case 'approved': return { bg: '#E8F5E9', text: '#2E7D32' };
    case 'pending':  return { bg: '#FFF8E1', text: '#F57F17' };
    case 'rejected': return { bg: '#FFEBEE', text: '#C62828' };
    case 'hidden':   return { bg: '#F3F4F6', text: '#4B5563' };
    case 'expired':  return { bg: '#EDE9FE', text: '#6D28D9' };
    default:         return { bg: '#F3F4F6', text: '#4B5563' };
  }
};

export default function MyAdsScreen() {
  const insets    = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = (n: number) => Math.min((width / BASE) * n, n * 1.4);

  const [ads, setAds] = useState<any[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);

  const isFirstLoad = React.useRef(true);

  // ✅ adService ব্যবহার করে ads fetch করা — token/URL handling সার্ভিস লেয়ারে
  const fetchMyAds = async (isRefresh = false) => {
    try {
      isRefresh ? setIsRefetching(true) : setIsLoading(true);
      const data = await adService.getMyAds();

      if (data.success) {
        setAds(data.data || []);
      } else {
        console.error('fetchMyAds failed:', data.message);
      }
    } catch (err) {
      console.error('fetchMyAds error:', err);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyAds(!isFirstLoad.current);
      isFirstLoad.current = false;
    }, [])
  );

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const daysLeft = (endDate: string) => {
    if (!endDate) return null;
    return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000));
  };

  // ✅ Renew বাটন দেখানো উচিত কিনা তা ঠিক করার হেল্পার ফাংশন
  const canRenew = (item: any, days: number | null) => {
    // Expired ad — সবসময় renew করা যাবে
    if (item.status === 'expired') return true;
    // Approved ad কিন্তু মেয়াদ শেষ হওয়ার কাছাকাছি (RENEW_WINDOW_DAYS এর মধ্যে)
    if (item.status === 'approved' && days !== null && days <= RENEW_WINDOW_DAYS) return true;
    return false;
  };

  const goToSubmitAd = () => {
    router.push('/(tabs)/entrepreneur/student/ads/submit' as any);
  };

  const AdCard = ({ item }: { item: any }) => {
    const sc      = statusColor(item.status);
    const days    = daysLeft(item.endDate);
    const showRenew = canRenew(item, days);

    return (
      <View style={[styles.card, { borderRadius: s(14) }]}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.adTitle, { fontSize: s(14) }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.bizName,  { fontSize: s(12) }]}>{item.business?.name}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.badgeText, { color: sc.text, fontSize: s(11) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { icon: 'eye-outline',         val: item.views,          label: 'Views'    },
            { icon: 'call-outline',         val: item.callClicks,     label: 'Calls'    },
            { icon: 'logo-whatsapp',        val: item.whatsappClicks, label: 'WhatsApp' },
            { icon: 'share-social-outline', val: item.shareCount,     label: 'Shares'   },
          ].map((stat) => (
            <View key={stat.label} style={styles.stat}>
              <Ionicons name={stat.icon as any} size={s(12)} color="#2D60FF" />
              <Text style={[styles.statVal,   { fontSize: s(11) }]}>{stat.val}</Text>
              <Text style={[styles.statLabel, { fontSize: s(10) }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Ionicons name="calendar-outline" size={s(12)} color="#aaa" />
            <Text style={[styles.dateText, { fontSize: s(11) }]}>Start: {formatDate(item.startDate)}</Text>
          </View>
          <View style={styles.dateItem}>
            <Ionicons name="time-outline" size={s(12)} color="#aaa" />
            <Text style={[styles.dateText, { fontSize: s(11) }]}>End: {formatDate(item.endDate)}</Text>
          </View>
        </View>

        {item.status === 'approved' && days !== null && (
          <View style={[styles.daysLeftPill, { backgroundColor: days <= 3 ? '#FFEBEE' : '#EEF2FF', borderRadius: s(20) }]}>
            <Ionicons
              name={days <= 3 ? 'warning-outline' : 'timer-outline'}
              size={s(12)} color={days <= 3 ? '#C62828' : '#2D60FF'}
            />
            <Text style={[styles.daysLeftText, { fontSize: s(11), color: days <= 3 ? '#C62828' : '#2D60FF' }]}>
              {days === 0 ? 'Expires today' : `${days} days left`}
            </Text>
          </View>
        )}

        <View style={styles.payRow}>
          <Text style={[styles.payLabel, { fontSize: s(11) }]}>Payment:</Text>
          <Text style={[styles.payVal, {
            fontSize: s(11),
            color: item.payment?.status === 'verified' ? '#2E7D32'
                 : item.payment?.status === 'pending'  ? '#F57F17' : '#C62828',
          }]}>
            {item.payment?.isFree ? 'Free' : `৳${item.payment?.finalAmount} — ${item.payment?.status}`}
          </Text>
        </View>

        {item.status === 'rejected' && item.rejectionReason && (
          <View style={styles.rejectBox}>
            <Ionicons name="alert-circle-outline" size={s(13)} color="#C62828" />
            <Text style={[styles.rejectText, { fontSize: s(11) }]}>{item.rejectionReason}</Text>
          </View>
        )}

        {/* ✅ মেয়াদ শেষ হওয়ার কাছাকাছি সতর্কতা ব্যানার (renew করার সাজেশন) */}
        {showRenew && item.status === 'approved' && (
          <View style={[styles.renewHint, { borderRadius: s(8) }]}>
            <Ionicons name="alert-circle-outline" size={s(13)} color="#E65100" />
            <Text style={[styles.renewHintText, { fontSize: s(11) }]}>
              Ad expiring soon — renew now to avoid interruption.
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EEF2FF' }]}
            onPress={() => router.push(`/(tabs)/entrepreneur/student/ads/${item._id}` as any)}>
            <Ionicons name="eye-outline" size={s(13)} color="#2D60FF" />
            <Text style={[styles.actionText, { color: '#2D60FF', fontSize: s(12) }]}>View</Text>
          </TouchableOpacity>

          {/* ✅ আপডেটেড Renew বাটন — expired অথবা মেয়াদ শেষ হওয়ার কাছাকাছি (≤7 দিন) approved ad-এ দেখাবে */}
          {showRenew && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E8F5E9' }]}
              onPress={() => router.push(`/(tabs)/entrepreneur/student/ads/renew/${item._id}` as any)}>
              <Ionicons name="refresh" size={s(13)} color="#2E7D32" />
              <Text style={[styles.actionText, { color: '#2E7D32', fontSize: s(12) }]}>Renew</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) return (
    <View style={styles.container}>
      <View style={styles.centered}><ActivityIndicator size="large" color="#2D60FF" /></View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.headerTitle, { fontSize: s(18) }]}>My Ads</Text>
          <Text style={[styles.headerSub, { fontSize: s(12) }]}>{ads.length} ad{ads.length !== 1 ? 's' : ''} total</Text>
        </View>
        <TouchableOpacity
          style={[styles.headerAddBtn, { borderRadius: s(10) }]}
          onPress={goToSubmitAd}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={s(18)} color="#fff" />
          <Text style={[styles.headerAddText, { fontSize: s(13) }]}>New Ad</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={ads}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => <AdCard item={item} />}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 90 }]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="megaphone-outline" size={52} color="#ddd" />
            <Text style={styles.emptyText}>No ads submitted yet</Text>
            <TouchableOpacity style={[styles.submitBtn, { borderRadius: s(12) }]}
              onPress={goToSubmitAd}>
              <Text style={[styles.submitBtnText, { fontSize: s(14) }]}>Submit Your First Ad</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => fetchMyAds(true)} colors={['#2D60FF']} />
        }
        showsVerticalScrollIndicator={false}
      />

      {ads.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 20, borderRadius: s(28) }]}
          onPress={goToSubmitAd}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={s(26)} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F3F5F7' },
  list:         { padding: 16 },
  centered:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  emptyText:    { color: '#aaa', fontSize: 15 },
  submitBtn:    { backgroundColor: '#2D60FF', paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  submitBtnText:{ color: '#fff', fontWeight: '700' },

  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
    backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#eee',
  },
  headerTitle: { fontWeight: '800', color: '#1A1A2E' },
  headerSub:   { color: '#888', marginTop: 2 },
  headerAddBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#2D60FF', paddingHorizontal: 14, paddingVertical: 9,
  },
  headerAddText: { color: '#fff', fontWeight: '700' },

  fab: {
    position: 'absolute', right: 20,
    width: 56, height: 56,
    backgroundColor: '#2D60FF',
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },

  card: {
    backgroundColor: '#fff', padding: 16,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  cardTop:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  adTitle:      { fontWeight: '700', color: '#1A1A2E' },
  bizName:      { color: '#888', marginTop: 2 },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
  badgeText:    { fontWeight: '600' },
  statsRow:     { flexDirection: 'row', gap: 14, marginBottom: 12 },
  stat:         { alignItems: 'center', gap: 2 },
  statVal:      { fontWeight: '700', color: '#1A1A2E' },
  statLabel:    { color: '#aaa' },
  dateRow:      { flexDirection: 'row', gap: 16, marginBottom: 10 },
  dateItem:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText:     { color: '#aaa' },
  daysLeftPill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
  daysLeftText: { fontWeight: '600' },
  payRow:       { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 10 },
  payLabel:     { color: '#888' },
  payVal:       { fontWeight: '600' },
  rejectBox:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFEBEE', padding: 8, borderRadius: 8, marginBottom: 10 },
  rejectText:   { color: '#C62828', flex: 1 },

  // ✅ renew hint banner style
  renewHint:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF3E0', padding: 8, marginBottom: 10 },
  renewHintText:{ color: '#E65100', flex: 1, fontWeight: '500' },

  actions:      { flexDirection: 'row', gap: 8 },
  actionBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  actionText:   { fontWeight: '600' },
});