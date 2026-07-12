
import { useMyAds, useMyBusinesses, useMyPayments } from '@/hooks/entrepreneur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator, RefreshControl, ScrollView,
    StyleSheet, Text, TouchableOpacity,
    useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE = 375;

export default function StudentDashboard() {
  const insets    = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = (n: number) => Math.min((width / BASE) * n, n * 1.4);

  const { data: businesses = [], isLoading: bizLoading,   refetch: refetchBiz,  isRefetching: refetchingBiz  } = useMyBusinesses();
  const { data: ads        = [], isLoading: adsLoading,   refetch: refetchAds,  isRefetching: refetchingAds  } = useMyAds();
  const { data: payments   = [], isLoading: payLoading,   refetch: refetchPay,  isRefetching: refetchingPay  } = useMyPayments();

  const isLoading    = bizLoading || adsLoading || payLoading;
  const isRefetching = refetchingBiz || refetchingAds || refetchingPay;

  const onRefresh = () => { refetchBiz(); refetchAds(); refetchPay(); };

  // Counts
  const approvedBiz  = businesses.filter((b: any) => b.status === 'approved').length;
  const pendingBiz   = businesses.filter((b: any) => b.status === 'pending').length;
  const activeAds    = ads.filter((a: any) => a.status === 'approved').length;
  const pendingAds   = ads.filter((a: any) => a.status === 'pending').length;
  const expiredAds   = ads.filter((a: any) => a.status === 'expired').length;
  const pendingPay   = payments.filter((p: any) => p.status === 'pending').length;
  const totalSpent   = payments
    .filter((p: any) => p.status === 'verified' && !p.isFree)
    .reduce((sum: number, p: any) => sum + p.finalAmount, 0);

  const StatCard = ({ label, value, icon, color, onPress }: any) => (
    <TouchableOpacity
      style={[styles.statCard, { borderRadius: s(14) }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={[styles.statIconBox, { backgroundColor: color + '18', borderRadius: s(10) }]}>
        <Ionicons name={icon} size={s(20)} color={color} />
      </View>
      <Text style={[styles.statVal, { fontSize: s(20), color }]}>{value}</Text>
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
      {/* <CommonHeader title="My Dashboard" showBackButton onBackPress={() => router.back()} /> */}
      <View style={styles.centered}><ActivityIndicator size="large" color="#2D60FF" /></View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* <CommonHeader title="My Dashboard" showBackButton onBackPress={() => router.back()} /> */}
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} colors={['#2D60FF']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome banner */}
        <View style={[styles.welcomeBanner, { borderRadius: s(16) }]}>
          <View>
            <Text style={[styles.welcomeTitle, { fontSize: s(18) }]}>My Business Hub</Text>
            <Text style={[styles.welcomeSub, { fontSize: s(13) }]}>
              Manage your businesses and advertisements
            </Text>
          </View>
          <View style={[styles.welcomeIcon, { width: s(52), height: s(52), borderRadius: s(26) }]}>
            <Ionicons name="briefcase" size={s(26)} color="#fff" />
          </View>
        </View>

        {/* Business stats */}
        <Text style={[styles.sectionTitle, { fontSize: s(14), marginBottom: s(10) }]}>My Businesses</Text>
        <View style={styles.statGrid}>
          <StatCard label="Total"    value={businesses.length} icon="storefront-outline" color="#2D60FF"
            onPress={() => router.push('/(tabs)/entrepreneur/student/businesses/my-businesses' as any)} />
          <StatCard label="Approved" value={approvedBiz}       icon="checkmark-circle-outline" color="#2E7D32" />
          <StatCard label="Pending"  value={pendingBiz}        icon="time-outline"       color="#F57F17" />
        </View>

        {/* Ad stats */}
        <Text style={[styles.sectionTitle, { fontSize: s(14), marginBottom: s(10), marginTop: s(8) }]}>My Ads</Text>
        <View style={styles.statGrid}>
          <StatCard label="Total"   value={ads.length} icon="megaphone-outline"   color="#2D60FF"
            onPress={() => router.push('/(tabs)/entrepreneur/student/ads/my-ads' as any)} />
          <StatCard label="Active"  value={activeAds}  icon="play-circle-outline" color="#2E7D32" />
          <StatCard label="Pending" value={pendingAds} icon="time-outline"         color="#F57F17" />
          <StatCard label="Expired" value={expiredAds} icon="hourglass-outline"   color="#9C27B0"
            onPress={() => router.push('/(tabs)/entrepreneur/student/ads/my-ads' as any)} />
        </View>

        {/* Payment summary */}
        <View style={[styles.payCard, { borderRadius: s(14) }]}>
          <View style={styles.payRow}>
            <Ionicons name="wallet-outline" size={s(20)} color="#2D60FF" />
            <Text style={[styles.payLabel, { fontSize: s(13) }]}>Total Spent</Text>
            <Text style={[styles.payVal, { fontSize: s(16) }]}>৳{totalSpent}</Text>
          </View>
          {pendingPay > 0 && (
            <View style={[styles.pendingPayRow, { borderRadius: s(8) }]}>
              <Ionicons name="alert-circle-outline" size={s(14)} color="#F57F17" />
              <Text style={[styles.pendingPayText, { fontSize: s(12) }]}>
                {pendingPay} payment{pendingPay > 1 ? 's' : ''} pending verification
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/entrepreneur/student/payments/index' as any)}>
                <Text style={[styles.pendingPayLink, { fontSize: s(12) }]}>View →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick actions */}
        <Text style={[styles.sectionTitle, { fontSize: s(14), marginBottom: s(10), marginTop: s(8) }]}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          <QuickAction label="Create Business" icon="storefront-outline" color="#2D60FF" bg="#EEF2FF"
            onPress={() => router.push('/(tabs)/entrepreneur/student/businesses/create' as any)} />
          <QuickAction label="Submit Ad"       icon="megaphone-outline"  color="#2E7D32" bg="#E8F5E9"
            onPress={() => router.push('/(tabs)/entrepreneur/student/ads/submit' as any)} />
          <QuickAction label="Explore Ads"     icon="grid-outline"       color="#9C27B0" bg="#F3E5F5"
            onPress={() => router.push('/(tabs)/entrepreneur/student/ads/index' as any)} />
          <QuickAction label="All Businesses"  icon="business-outline"   color="#E65100" bg="#FFF3E0"
            onPress={() => router.push('/(tabs)/entrepreneur/student/businesses/index' as any)} />
          <QuickAction label="My Payments"     icon="card-outline"       color="#C62828" bg="#FFEBEE"
            onPress={() => router.push('/(tabs)/entrepreneur/student/payments/index' as any)} />
          <QuickAction label="Packages"        icon="cube-outline"       color="#0288D1" bg="#E1F5FE"
            onPress={() => router.push('/(tabs)/entrepreneur/student/packages/index' as any)} />
        </View>

        {/* Recent ads */}
        {ads.length > 0 && (
          <View style={[styles.recentCard, { borderRadius: s(14) }]}>
            <View style={styles.recentHeader}>
              <Text style={[styles.sectionTitle, { fontSize: s(14) }]}>Recent Ads</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/entrepreneur/student/ads/my-ads' as any)}>
                <Text style={[styles.seeAll, { fontSize: s(12) }]}>See All →</Text>
              </TouchableOpacity>
            </View>
            {ads.slice(0, 3).map((ad: any) => {
              const sc = ad.status === 'approved' ? { bg: '#E8F5E9', text: '#2E7D32' }
                       : ad.status === 'pending'  ? { bg: '#FFF8E1', text: '#F57F17' }
                       : ad.status === 'expired'  ? { bg: '#EDE9FE', text: '#6D28D9' }
                       :                            { bg: '#FFEBEE', text: '#C62828' };
              const daysLeft = ad.endDate
                ? Math.max(0, Math.ceil((new Date(ad.endDate).getTime() - Date.now()) / 86400000))
                : null;
              return (
                <TouchableOpacity
                  key={ad._id}
                  style={[styles.recentItem, { borderRadius: s(10) }]}
                  onPress={() => router.push(`/(tabs)/entrepreneur/student/ads/${ad._id}` as any)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recentAdTitle, { fontSize: s(13) }]} numberOfLines={1}>{ad.title}</Text>
                    <Text style={[styles.recentAdBiz,   { fontSize: s(11) }]}>{ad.business?.name}</Text>
                  </View>
                  <View>
                    <View style={[styles.recentBadge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.recentBadgeText, { color: sc.text, fontSize: s(10) }]}>
                        {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                      </Text>
                    </View>
                    {daysLeft !== null && ad.status === 'approved' && (
                      <Text style={[styles.daysLeft, { fontSize: s(10), color: daysLeft <= 3 ? '#C62828' : '#aaa' }]}>
                        {daysLeft}d left
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F3F5F7' },
  scroll:          { padding: 16 },
  centered:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  welcomeBanner:   { backgroundColor: '#2D60FF', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcomeTitle:    { color: '#fff', fontWeight: '800' },
  welcomeSub:      { color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  welcomeIcon:     { backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  sectionTitle:    { fontWeight: '700', color: '#1A1A2E' },
  statGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  statCard:        { backgroundColor: '#fff', padding: 14, alignItems: 'center', flex: 1, minWidth: 90, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  statIconBox:     { padding: 8, marginBottom: 6 },
  statVal:         { fontWeight: '700' },
  statLabel:       { color: '#888', marginTop: 2, textAlign: 'center' },
  payCard:         { backgroundColor: '#fff', padding: 16, marginTop: 8, marginBottom: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  payRow:          { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payLabel:        { color: '#666', fontWeight: '600' },
  payVal:          { color: '#2D60FF', fontWeight: '700', marginLeft: 'auto' },
  pendingPayRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF8E1', padding: 10, marginTop: 10 },
  pendingPayText:  { color: '#F57F17', flex: 1 },
  pendingPayLink:  { color: '#2D60FF', fontWeight: '700' },
  quickGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  quickAction:     { padding: 14, alignItems: 'center', gap: 8, width: '47%' },
  quickActionText: { fontWeight: '600', textAlign: 'center' },
  recentCard:      { backgroundColor: '#fff', padding: 16, marginTop: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  recentHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll:          { color: '#2D60FF', fontWeight: '600' },
  recentItem:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FF', padding: 12, marginBottom: 8 },
  recentAdTitle:   { fontWeight: '700', color: '#1A1A2E' },
  recentAdBiz:     { color: '#888', marginTop: 2 },
  recentBadge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-end' },
  recentBadgeText: { fontWeight: '600' },
  daysLeft:        { textAlign: 'right', marginTop: 2 },
});