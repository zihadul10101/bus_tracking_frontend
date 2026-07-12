import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import AdsSlider from '../../components/AdsSlider';
import LiveTabFilter from '../../components/LiveTabFilter';
import LiveTripCard from '../../components/LiveTripCard';
import { useLiveTrips } from '../../hooks/useLiveTrips';

export default function HomePage() {
  const { liveTrips, loading, refreshing, error, currentCounts, refetch } = useLiveTrips();
  const [activeTab, setActiveTab] = useState<'running' | 'future' | 'completed'>('running');

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

        <AdsSlider />

        <View style={styles.liveSectionHeader}>
          <Text style={styles.sectionTitle}>Today's live trips</Text>
          {currentCounts.running > 0 && <View style={styles.liveDotPulse} />}
        </View>


        <LiveTabFilter
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={currentCounts}
        />

        {error ? (
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
});
