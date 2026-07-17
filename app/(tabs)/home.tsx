import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import LiveTabFilter from '../../components/LiveTabFilter';
import LiveTripCard from '../../components/LiveTripCard';
import { useLiveTrips } from '../../hooks/useLiveTrips';

export default function HomePage() {
  const {
    liveTrips,
    loading,
    refreshing,
    error,
    currentCounts,
    refetch,
    isFromCache,
    isStale,
  } = useLiveTrips();
  const [activeTab, setActiveTab] = useState<'running' | 'future' | 'completed'>('running');

  // ✅ FIX: error থাকলেও cached ডেটা থাকলে সেটাকে "hard block" ধরা হবে না।
  // শুধু তখনই full error box দেখাবে যখন error আছে AND দেখানোর মতো কোনো cached ডেটাও নেই।
  const hasAnyCachedData =
    currentCounts.running > 0 || currentCounts.future > 0 || currentCounts.completed > 0;
  const showHardError = !!error && !hasAnyCachedData;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => refetch(true)} colors={["#2563eb"]} />
      }
    >
      <View style={styles.mainContentWrapper}>

        <View style={styles.liveSectionHeader}>
          <Text style={styles.sectionTitle}>Today's live trips</Text>
          {currentCounts.running > 0 && <View style={styles.liveDotPulse} />}

          {isFromCache && (
            <View style={[styles.cacheBadge, isStale ? styles.cacheBadgeStale : styles.cacheBadgeFresh]}>
              {isStale && <ActivityIndicator size="small" color="#92400e" style={{ marginRight: 4 }} />}
              <Text style={[styles.cacheBadgeText, isStale ? styles.cacheBadgeTextStale : styles.cacheBadgeTextFresh]}>
                {isStale ? 'Updating…' : 'Cached'}
              </Text>
            </View>
          )}
        </View>

        <LiveTabFilter
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={currentCounts}
        />

        {/* ✅ NEW: error আছে কিন্তু cached ডেটাও আছে — non-blocking ছোট banner */}
        {error && hasAnyCachedData && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>
              ⚠️ ইন্টারনেট নেই — সর্বশেষ সেভ করা তথ্য দেখানো হচ্ছে
            </Text>
          </View>
        )}

        {showHardError ? (
          // ✅ কোনো cached ডেটাই নেই (একদম প্রথমবার offline-এ খুললে) — তখনই শুধু full error box
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyText, { color: '#ef4444' }]}>{error}</Text>
          </View>
        ) : loading ? (
          <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Live trip is updating....</Text>
          </View>
        ) : (
          <View style={styles.featuredSection}>
            {liveTrips[activeTab]?.length > 0 ? (
              liveTrips[activeTab].map((trip) => (
                <LiveTripCard key={trip._id} trip={trip} status={activeTab} />
              ))
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  No trips found  {activeTab === 'running' ? 'running' : activeTab === 'future' ? 'future' : 'completed'} at the moment.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  contentContainer: { paddingBottom: 40 },
  mainContentWrapper: { marginTop: 10, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 12 },
  liveSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDotPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', marginBottom: 12 },
  featuredSection: { width: '100%' },
  centerLoader: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 12, color: '#64748b', marginTop: 8 },
  emptyBox: { padding: 40, alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  emptyText: { color: '#94a3b8', fontSize: 13, textAlign: 'center', lineHeight: 18 },

  cacheBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 12,
    marginLeft: 2,
  },
  cacheBadgeFresh: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  cacheBadgeStale: { backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fde68a' },
  cacheBadgeText: { fontSize: 10, fontWeight: '700' },
  cacheBadgeTextFresh: { color: '#64748b' },
  cacheBadgeTextStale: { color: '#92400e' },

  // 👈 NEW: non-blocking offline banner
  offlineBanner: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  offlineBannerText: { fontSize: 11, color: '#92400e', textAlign: 'center', fontWeight: '600' },
});