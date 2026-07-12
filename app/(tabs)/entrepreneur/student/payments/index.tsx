import { paymentService } from '@/src/services/entrepreneur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Platform,
  RefreshControl, StyleSheet, Text,
  TouchableOpacity, useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE = 375;
// const API_BASE_URL = 'http://192.168.0.195:5000'; // ✅ আপনার সার্ভার IP

const statusColor = (s: string) => {
  switch (s) {
    case 'verified': return { bg: '#E8F5E9', text: '#2E7D32' };
    case 'pending':  return { bg: '#FFF8E1', text: '#F57F17' };
    case 'rejected': return { bg: '#FFEBEE', text: '#C62828' };
    case 'refunded': return { bg: '#EDE9FE', text: '#6D28D9' };
    default:         return { bg: '#F3F4F6', text: '#4B5563' };
  }
};

export default function StudentPaymentsScreen() {
  const insets    = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = (n: number) => Math.min((width / BASE) * n, n * 1.4);

  // ✅ react-query হুকের বদলে নিজস্ব state
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);

  // ✅ সরাসরি fetch ফাংশন
  // const fetchMyPayments = async (isRefresh = false) => {
  //   try {
  //     isRefresh ? setIsRefetching(true) : setIsLoading(true);
  //     const token = await AsyncStorage.getItem('userToken');
  //     const res = await fetch(`${API_BASE_URL}/api/v1/entrepreneur/payments/my`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const data = await res.json();
  //     if (data.success) {
  //       setPayments(data.data || []);
  //     } else {
  //       console.error('fetchMyPayments failed:', data.message);
  //     }
  //   } catch (err) {
  //     console.error('fetchMyPayments error:', err);
  //   } finally {
  //     isRefresh ? setIsRefetching(false) : setIsLoading(false);
  //   }
  // };


  const fetchMyPayments = async (isRefresh = false) => {
  try {
    isRefresh ? setIsRefetching(true) : setIsLoading(true);

    const data = await paymentService.getMyPayments();

    if (data.success) {
      setPayments(data.data || []);
    } else {
      console.error('fetchMyPayments:', data.message);
    }
  } catch (err: any) {
    console.error(
      'fetchMyPayments:',
      err?.response?.data?.message || err.message
    );
  } finally {
    isRefresh
      ? setIsRefetching(false)
      : setIsLoading(false);
  }
};
  // ✅ কম্পোনেন্ট mount হওয়ার সাথে সাথেই fetch করুন
  useEffect(() => {
    fetchMyPayments();
  }, []);

  const totalSpent = payments
    .filter((p: any) => p.status === 'verified' && !p.isFree)
    .reduce((sum: number, p: any) => sum + p.finalAmount, 0);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const PayCard = ({ item }: { item: any }) => {
    const sc = statusColor(item.status);
    return (
      <View style={[styles.card, { borderRadius: s(14) }]}>
        <View style={styles.cardTop}>
          <View style={[styles.iconBox, {
            width: s(44), height: s(44), borderRadius: s(10),
            backgroundColor: item.isFree ? '#E8F5E9' : '#EEF2FF',
          }]}>
            <Ionicons
              name={item.isFree ? 'gift-outline' : 'card-outline'}
              size={s(20)}
              color={item.isFree ? '#2E7D32' : '#2D60FF'}
            />
          </View>
          <View style={{ flex: 1, marginLeft: s(10) }}>
            <Text style={[styles.adTitle, { fontSize: s(13) }]} numberOfLines={1}>
              {item.advertisement?.title ?? 'Ad Payment'}
            </Text>
            <Text style={[styles.pkgName, { fontSize: s(12) }]}>
              {item.package?.name} · {item.package?.durationDays}d
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.badgeText, { color: sc.text, fontSize: s(11) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.amountRow}>
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { fontSize: s(11) }]}>Original</Text>
            <Text style={[styles.amountVal,   { fontSize: s(13) }]}>৳{item.originalAmount}</Text>
          </View>
          {item.discountAmount > 0 && (
            <View style={styles.amountItem}>
              <Text style={[styles.amountLabel, { fontSize: s(11) }]}>Discount</Text>
              <Text style={[styles.amountVal,   { fontSize: s(13), color: '#2E7D32' }]}>
                -৳{item.discountAmount}
              </Text>
            </View>
          )}
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { fontSize: s(11) }]}>Paid</Text>
            <Text style={[styles.amountVal,   { fontSize: s(16), color: '#2D60FF', fontWeight: '700' }]}>
              {item.isFree ? 'FREE' : `৳${item.finalAmount}`}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="phone-portrait-outline" size={s(12)} color="#aaa" />
            <Text style={[styles.metaText, { fontSize: s(11) }]}>
              {item.paymentMethod?.toUpperCase() ?? '—'}
            </Text>
          </View>
          {item.transactionId && (
            <View style={styles.metaItem}>
              <Ionicons name="receipt-outline" size={s(12)} color="#aaa" />
              <Text style={[styles.metaText, { fontSize: s(11) }]}>{item.transactionId}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={s(12)} color="#aaa" />
            <Text style={[styles.metaText, { fontSize: s(11) }]}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        {item.note && (
          <View style={styles.noteBox}>
            <Ionicons name="chatbox-outline" size={s(12)} color="#888" />
            <Text style={[styles.noteText, { fontSize: s(11) }]}>{item.note}</Text>
          </View>
        )}

        {item.status === 'pending' && (
          <View style={[styles.pendingBanner, { borderRadius: s(8) }]}>
            <Ionicons name="time-outline" size={s(13)} color="#F57F17" />
            <Text style={[styles.pendingText, { fontSize: s(12) }]}>
              Awaiting admin verification
            </Text>
          </View>
        )}
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
      <FlatList
        data={payments}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => <PayCard item={item} />}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          payments.length > 0 ? (
            <View style={[styles.summaryCard, { borderRadius: s(14), marginBottom: s(16) }]}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { fontSize: s(18) }]}>{payments.length}</Text>
                <Text style={[styles.summaryLabel, { fontSize: s(11) }]}>Total</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { fontSize: s(18), color: '#2E7D32' }]}>
                  {payments.filter((p: any) => p.status === 'verified').length}
                </Text>
                <Text style={[styles.summaryLabel, { fontSize: s(11) }]}>Verified</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { fontSize: s(18), color: '#2D60FF' }]}>
                  ৳{totalSpent}
                </Text>
                <Text style={[styles.summaryLabel, { fontSize: s(11) }]}>Spent</Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="wallet-outline" size={52} color="#ddd" />
            <Text style={styles.emptyText}>No payments yet</Text>
            <TouchableOpacity
              style={[styles.submitBtn, { borderRadius: s(12) }]}
              onPress={() => router.push('/(tabs)/entrepreneur/student/ads/submit' as any)}
            >
              <Text style={[styles.submitBtnText, { fontSize: s(14) }]}>Submit Your First Ad</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => fetchMyPayments(true)} colors={['#2D60FF']} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F3F5F7' },
  list:           { padding: 16 },
  centered:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  emptyText:      { color: '#aaa', fontSize: 15 },
  submitBtn:      { backgroundColor: '#2D60FF', paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  submitBtnText:  { color: '#fff', fontWeight: '700' },
  summaryCard:    { backgroundColor: '#fff', flexDirection: 'row', padding: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
  summaryItem:    { flex: 1, alignItems: 'center' },
  summaryVal:     { fontWeight: '700', color: '#1A1A2E' },
  summaryLabel:   { color: '#aaa', marginTop: 2 },
  summaryDivider: { width: 0.5, height: 36, backgroundColor: '#eee' },
  card: {
    backgroundColor: '#fff', padding: 16,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  cardTop:       { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox:       { alignItems: 'center', justifyContent: 'center' },
  adTitle:       { fontWeight: '700', color: '#1A1A2E' },
  pkgName:       { color: '#888', marginTop: 2 },
  badge:         { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:     { fontWeight: '600' },
  amountRow:     { flexDirection: 'row', gap: 20, marginBottom: 12 },
  amountItem:    {},
  amountLabel:   { color: '#aaa' },
  amountVal:     { fontWeight: '600', color: '#1A1A2E', marginTop: 2 },
  metaRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  metaItem:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:      { color: '#aaa' },
  noteBox:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8, marginBottom: 8 },
  noteText:      { color: '#555', flex: 1 },
  pendingBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF8E1', padding: 8 },
  pendingText:   { color: '#F57F17', fontWeight: '500' },
});