import React from 'react';
import { StyleSheet, Text, View } from 'react-native';


interface LiveTripCardProps {
  trip: {
    _id?: string;
    busNo: string;
    busName: string;
    tripTitle: string;
    from?: { stop: string; time: string } | null;
    to?: { stop: string; time: string } | null;
    driver?: {
      name: string;
      mobile: string;
    } | null;
  };
  status: 'running' | 'future' | 'completed';
}

export default function LiveTripCard({ trip, status }: LiveTripCardProps) {
  

  const indicatorColor = 
    status === 'running' ? '#10b981' : 
    status === 'future' ? '#3b82f6' : '#94a3b8';

  return (
    <View style={styles.liveTripCard}>
      <View style={styles.cardTopRow}>
        <View style={styles.busBadge}>
          <Text style={styles.busBadgeText}>{trip.busName} ( {trip.busNo})</Text>
        </View>
        <Text style={styles.tripTimeText}>
          ⏰ {trip.from?.time} - {trip.to?.time}
        </Text>
      </View>

      <Text style={styles.tripTitleText}>{trip.tripTitle}</Text>

      <View style={styles.routePointsBox}>
        <Text style={styles.routePointText}>🗺️ {trip.from?.stop} ➔ {trip.to?.stop}</Text>
      </View>

      <View style={styles.driverSection}>
        {trip.driver ? (
          <View style={styles.driverRow}>
            <Text style={styles.driverLabel}>👤 Driver: </Text>
            <Text style={styles.driverName}>{trip.driver.name}</Text>
            <Text style={styles.driverDivider}>|</Text>
            <Text style={styles.driverMobile}>📞 {trip.driver.mobile}</Text>
          </View>
        ) : (
          <Text style={styles.noDriverText}>⚠️ No driver has been assigned.</Text>
        )}
      </View>

      <View style={[styles.statusIndicatorBar, { backgroundColor: indicatorColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  liveTripCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    paddingBottom: 20, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    elevation: 1,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  busBadge: { backgroundColor: '#1e3a8a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  busBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  tripTimeText: { fontSize: 12, fontWeight: 'bold', color: '#2563eb' },
  tripTitleText: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginTop: 10, lineHeight: 20 },
  routePointsBox: { marginTop: 8, backgroundColor: '#f8fafc', padding: 8, borderRadius: 8 },
  routePointText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  
  driverSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverLabel: { fontSize: 12, color: '#64748b' },
  driverName: { fontSize: 12, fontWeight: '700', color: '#334155' },
  driverDivider: { marginHorizontal: 8, color: '#cbd5e1' },
  driverMobile: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
  noDriverText: { fontSize: 11, color: '#94a3b8', fontStyle: 'italic' },

  statusIndicatorBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 4 },
});