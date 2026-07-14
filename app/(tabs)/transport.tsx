import { busService } from '@/src/services/busService';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCachedResource } from '../../hooks/useCachedResource'; // path adjust করুন আপনার hooks ফোল্ডার অনুযায়ী


interface Stop {
  stopName: string;
  time: string | null;
  sequence: number;
}

interface Trip {
  _id: string;
  tripTitle: string;
  days: string[];
  stops: Stop[];
  from?: { stop: string; time: string; } | null;
  to?: { stop: string; time: string; } | null;
}

interface Bus {
  _id: string;
  busNo: string;
  busName: string;
  trips: Trip[];
  driverId?: {
    _id: string;
    name: string;
    mobile: string;
  } | null;
}

export default function TransportPage() {

  const {
    data: buses,
    loading,
    refreshing,
    error,
    refresh,
  } = useCachedResource<Bus[]>(
    '@transport_buses', // cache key
    async () => {
      const result = await busService.getAllBuses();
      if (!result.success) throw new Error(result.message || 'Failed to load bus information.');
      return result.data;
    },
    [] // default value যতক্ষণ cache/network কিছুই না আসে
  );

  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);



  useEffect(() => {
    if (!buses || buses.length === 0) return;

    setSelectedBus((prevBus) => {
      const stillExists = prevBus ? buses.find((b) => b._id === prevBus._id) : null;
      const nextBus = stillExists || buses[0];

      setSelectedTrip((prevTrip) => {
        if (!nextBus.trips || nextBus.trips.length === 0) return null;
        const tripStillExists = prevTrip
          ? nextBus.trips.find((t) => t._id === prevTrip._id)
          : null;
        return tripStillExists || nextBus.trips[0];
      });

      return nextBus;
    });
  }, [buses]);

  const handleBusSelect = (bus: Bus) => {
    setSelectedBus(bus);
    setSelectedTrip(bus.trips && bus.trips.length > 0 ? bus.trips[0] : null);
  };

  const getTripLabel = (trip: Trip, index: number) => {
    const startTime = trip.from?.time || "";
    if (startTime.includes("AM")) {
      const hour = parseInt(startTime.split(":")[0]);
      return hour < 9 ? `সকাল (Trip ${index + 1})` : `দুপুর (Trip ${index + 1})`;
    }
    return `বিকাল/সন্ধ্যা (Trip ${index + 1})`;
  };

  // ✅ শুধু প্রথমবার cache read এর সময় (মিলিসেকেন্ড কয়েকের) spinner দেখাবে
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Cache-ও খালি + network-ও fail — তখনই শুধু error state দেখাবে
  if (error && buses.length === 0) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: '#ef4444', marginBottom: 12, textAlign: 'center', paddingHorizontal: 20 }}>
          {error}
        </Text>
        <TouchableOpacity onPress={refresh}>
          <Text style={{ color: '#2563eb', fontWeight: '700' }}>Try again.</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.tabWrapper}>
        <Text style={styles.sectionLabel}>Select a bus:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {buses.map((bus) => (
            <TouchableOpacity
              key={bus._id}
              style={[
                styles.busTab,
                selectedBus?._id === bus._id && styles.activeBusTab,
              ]}
              onPress={() => handleBusSelect(bus)}
            >
              <Text style={[styles.busTabText, selectedBus?._id === bus._id && styles.activeText]}>
                🚌 Bus {bus.busNo}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedBus && selectedBus.trips.length > 0 && (
        <View style={styles.tabWrapper}>
          <Text style={styles.sectionLabel}>Select a trip ({selectedBus.trips.length}trips available):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedBus.trips.map((trip, index) => (
              <TouchableOpacity
                key={trip._id}
                style={[
                  styles.tripTab,
                  selectedTrip?._id === trip._id && styles.activeTripTab,
                ]}
                onPress={() => setSelectedTrip(trip)}
              >
                <Text style={[styles.tripTabText, selectedTrip?._id === trip._id && styles.activeText]}>
                  ⏱️ {trip.from?.time || 'No Time'} - {getTripLabel(trip, index)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedTrip ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.detailsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={["#2563eb"]} tintColor="#2563eb" />
          }
        >
          <View style={styles.mainCard}>

            <View style={styles.routeTitleBox}>
              <Text style={styles.routeTitleText}>{selectedTrip.tripTitle}</Text>
            </View>

            <View style={styles.driverCard}>
              <Text style={styles.driverHeader}>📋 অন-ডিউটি ড্রাইভারের তথ্য</Text>
              {selectedBus?.driverId && typeof selectedBus.driverId === 'object' ? (
                <View style={styles.driverInfoRow}>
                  <View style={styles.driverDetailBlock}>
                    <Text style={styles.driverLabel}>👤 নাম</Text>
                    <Text style={styles.driverValue}>{selectedBus.driverId.name}</Text>
                  </View>

                  <View style={styles.driverDividerLine} />

                  <View style={styles.driverDetailBlock}>
                    <Text style={styles.driverLabel}>📞 মোবাইল নম্বর</Text>
                    <Text style={styles.driverValue}>{selectedBus.driverId.mobile}</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.noDriverText}>⚠️ এই বাসে বর্তমানে কোনো ড্রাইভার নির্ধারিত নেই</Text>
              )}
            </View>

            {selectedTrip.from && selectedTrip.to && (
              <View style={styles.timeSummary}>
                <View style={styles.timeNode}>
                  <Text style={styles.nodeLabel}>প্রথম স্টপ</Text>
                  <Text style={styles.nodeTime}>{selectedTrip.from.time}</Text>
                </View>
                <Text style={styles.routeArrow}>➔</Text>
                <View style={styles.timeNode}>
                  <Text style={styles.nodeLabel}>শেষ গন্তব্য</Text>
                  <Text style={styles.nodeTime}>{selectedTrip.to.time}</Text>
                </View>
              </View>
            )}

            <Text style={styles.timelineHeader}>📍 সম্পূর্ণ স্টপেজ ও সময়সূচী</Text>
            <View style={styles.timelineBody}>
              {selectedTrip.stops.map((stop, index) => {
                const isFirst = index === 0;
                const isLast = index === selectedTrip.stops.length - 1;
                return (
                  <View key={index} style={styles.timelineRow}>
                    <View style={styles.lineIndicatorBox}>
                      <View style={[styles.dot, isFirst && styles.greenDot, isLast && styles.redDot]} />
                      {!isLast && <View style={styles.verticalLine} />}
                    </View>
                    <View style={styles.stopInfoBox}>
                      <Text style={[styles.stopName, (isFirst || isLast) && styles.boldStopName]}>
                        {stop.stopName}
                      </Text>
                      {stop.time && <Text style={styles.stopBadgeTime}>{stop.time}</Text>}
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.daysBox}>
              <Text style={styles.daysTitle}>চলবে: </Text>
              <Text style={styles.daysList}>{selectedTrip.days.join(', ')}</Text>
            </View>

          </View>
        </ScrollView>
      ) : (
        <View style={styles.noTripBox}>
          <Text>এই বাসের কোনো ট্রিপ ডাটা পাওয়া যায়নি।</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16, paddingTop: 30 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  tabWrapper: { marginBottom: 14 },
  busTab: { backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  activeBusTab: { backgroundColor: '#1e3a8a', borderColor: '#1e3a8a' },
  busTabText: { fontWeight: '700', color: '#475569' },
  tripTab: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 6, borderWidth: 1, borderColor: '#cbd5e1' },
  activeTripTab: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  tripTabText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  activeText: { color: '#fff' },
  detailsContainer: { flex: 1 },
  mainCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  routeTitleBox: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, marginBottom: 14 },
  routeTitleText: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', textAlign: 'center', lineHeight: 20 },
  driverCard: { backgroundColor: '#f8fafc', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 14 },
  driverHeader: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 8 },
  driverInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  driverDetailBlock: { flex: 1 },
  driverLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  driverValue: { fontSize: 13, fontWeight: '700', color: '#1e293b', marginTop: 2 },
  driverDividerLine: { width: 1, height: 25, backgroundColor: '#cbd5e1', marginHorizontal: 12 },
  noDriverText: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', paddingVertical: 4 },
  timeSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginBottom: 14 },
  timeNode: { alignItems: 'center', flex: 1 },
  nodeLabel: { fontSize: 11, color: '#64748b' },
  nodeTime: { fontSize: 18, fontWeight: 'bold', color: '#1e3a8a', marginTop: 2 },
  routeArrow: { fontSize: 20, color: '#94a3b8' },
  timelineHeader: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 12 },
  timelineBody: { paddingLeft: 4 },
  timelineRow: { flexDirection: 'row', minHeight: 45 },
  lineIndicatorBox: { alignItems: 'center', width: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#cbd5e1', zIndex: 2 },
  greenDot: { backgroundColor: '#10b981', width: 12, height: 12, borderRadius: 6 },
  redDot: { backgroundColor: '#ef4444', width: 12, height: 12, borderRadius: 6 },
  verticalLine: { width: 2, flex: 1, backgroundColor: '#cbd5e1', position: 'absolute', top: 10, bottom: 0, zIndex: 1 },
  stopInfoBox: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 10, paddingBottom: 15 },
  stopName: { fontSize: 13, color: '#475569' },
  boldStopName: { fontWeight: 'bold', color: '#0f172a' },
  stopBadgeTime: { fontSize: 12, fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  daysBox: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12, marginTop: 5 },
  daysTitle: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  daysList: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  noTripBox: { alignItems: 'center', justifyContent: 'center', padding: 30 },
});