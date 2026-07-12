import { adService } from '@/src/services/entrepreneur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, RefreshControl, ScrollView,
  StyleSheet, Text, TouchableOpacity,
  useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE = 375;


export default function AdminDashboard() {
  const insets    = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = (n: number) => Math.min((width / BASE) * n, n * 1.4);

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);

const fetchDashboard = async (isRefresh = false) => {
  try {
    isRefresh ? setIsRefetching(true) : setIsLoading(true);

    const data = await adService.adminDashboard();

    if (data.success) {
      setData(data.data);
    } else {
      console.error('fetchDashboard:', data.message);
    }
  } catch (err: any) {
    console.error(
      'fetchDashboard:',
      err?.response?.data?.message || err.message
    );
  } finally {
    isRefresh ? setIsRefetching(false) : setIsLoading(false);
  }
};



  useEffect(() => {
    fetchDashboard();
  }, []);

  const StatCard = ({ label, value, icon, color, onPress }: any) => (
    <TouchableOpacity
      style={[styles.statCard, { borderRadius: s(14) }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={[styles.statIconBox, { backgroundColor: color + '18', borderRadius: s(10) }]}>
        <Ionicons name={icon} size={s(22)} color={color} />
      </View>
      <Text style={[styles.statVal, { fontSize: s(22), color }]}>{value ?? 0}</Text>
      <Text style={[styles.statLabel, { fontSize: s(11) }]}>{label}</Text>
    </TouchableOpacity>
  );

  const QuickAction = ({ label, icon, color, bg, onPress }: any) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: bg, borderRadius: s(12) }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={s(22)} color={color} />
      <Text style={[styles.quickActionText, { color, fontSize: s(12) }]}>{label}</Text>
    </TouchableOpacity>
  );

  if (isLoading) return (
    <View style={styles.container}>
      <View style={styles.centered}><ActivityIndicator size="large" color="#2D60FF" /></View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => fetchDashboard(true)} colors={['#2D60FF']} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.revBanner, { borderRadius: s(16) }]}>
          <View>
            <Text style={[styles.revLabel, { fontSize: s(13) }]}>Total Revenue</Text>
            <Text style={[styles.revVal,   { fontSize: s(28) }]}>৳{data?.revenue ?? 0}</Text>
          </View>
          <View style={[styles.revIcon, { width: s(56), height: s(56), borderRadius: s(28) }]}>
            <Ionicons name="trending-up" size={s(28)} color="#fff" />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { fontSize: s(14), marginBottom: s(10) }]}>Businesses</Text>
        <View style={styles.statGrid}>
          <StatCard label="Total"    value={data?.businesses?.total}
            icon="storefront-outline" color="#2D60FF"
            onPress={() => router.push('/(tabs)/entrepreneur/admin/businesses' as any)} />
          <StatCard label="Pending"  value={data?.businesses?.pending}
            icon="time-outline" color="#F57F17"
            onPress={() => router.push({ pathname: '/(tabs)/entrepreneur/admin/businesses' as any, params: { status: 'pending' } })} />
          <StatCard label="Approved" value={data?.businesses?.approved}
            icon="checkmark-circle-outline" color="#2E7D32"
            onPress={() => router.push({ pathname: '/(tabs)/entrepreneur/admin/businesses' as any, params: { status: 'approved' } })} />
        </View>

        <Text style={[styles.sectionTitle, { fontSize: s(14), marginBottom: s(10), marginTop: s(8) }]}>Advertisements</Text>
        <View style={styles.statGrid}>
          <StatCard label="Total"   value={data?.ads?.total}   icon="megaphone-outline"   color="#2D60FF" />
          <StatCard label="Pending" value={data?.ads?.pending} icon="time-outline"         color="#F57F17"
            onPress={() => router.push({ pathname: '/(tabs)/entrepreneur/admin/ads' as any, params: { status: 'pending' } })} />
          <StatCard label="Active"  value={data?.ads?.active}  icon="play-circle-outline" color="#2E7D32" />
          <StatCard label="Expired" value={data?.ads?.expired} icon="hourglass-outline"   color="#9C27B0" />
        </View>

        <Text style={[styles.sectionTitle, { fontSize: s(14), marginBottom: s(10), marginTop: s(8) }]}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          <QuickAction label="Review Businesses" icon="storefront-outline" color="#2D60FF" bg="#EEF2FF"
            onPress={() => router.push({ pathname: '/(tabs)/entrepreneur/admin/businesses' as any, params: { status: 'pending' } })} />
          <QuickAction label="Review Ads"        icon="megaphone-outline"  color="#F57F17" bg="#FFF8E1"
            onPress={() => router.push({ pathname: '/(tabs)/entrepreneur/admin/ads' as any, params: { status: 'pending' } })} />
          <QuickAction label="Verify Payments"   icon="card-outline"       color="#2E7D32" bg="#E8F5E9"
            onPress={() => router.push({ pathname: '/(tabs)/entrepreneur/admin/payments' as any, params: { status: 'pending' } })} />
          <QuickAction label="Coupons"           icon="pricetag-outline"   color="#9C27B0" bg="#F3E5F5"
            onPress={() => router.push('/(tabs)/entrepreneur/admin/coupons' as any)} />
          <QuickAction label="Packages"          icon="cube-outline"       color="#E65100" bg="#FFF3E0"
            onPress={() => router.push('/(tabs)/entrepreneur/admin/packages' as any)} />
          <QuickAction label="Revenue"           icon="bar-chart-outline"  color="#C62828" bg="#FFEBEE"
            onPress={() => router.push('/(tabs)/entrepreneur/admin/payments' as any)} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F3F5F7' },
  scroll:          { padding: 16 },
  centered:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  revBanner:       { backgroundColor: '#2D60FF', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  revLabel:        { color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  revVal:          { color: '#fff', fontWeight: '700', marginTop: 4 },
  revIcon:         { backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  sectionTitle:    { fontWeight: '700', color: '#1A1A2E' },
  statGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  statCard:        { backgroundColor: '#fff', padding: 14, alignItems: 'center', flex: 1, minWidth: 90, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  statIconBox:     { padding: 10, marginBottom: 8 },
  statVal:         { fontWeight: '700' },
  statLabel:       { color: '#888', marginTop: 2, textAlign: 'center' },
  quickGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickAction:     { padding: 14, alignItems: 'center', gap: 8, width: '47%' },
  quickActionText: { fontWeight: '600', textAlign: 'center' },
});