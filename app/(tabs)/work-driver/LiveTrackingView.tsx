import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface Props {
  location: { latitude: number; longitude: number } | null;
  onStop: () => void;
  viewerCount?: number;
}

export default function LiveTrackingView({ location, onStop, viewerCount = 0 }: Props) {
  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        region={{
          latitude: location?.latitude || 22.3569, // default fallback
          longitude: location?.longitude || 91.7832,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        {location && <Marker coordinate={location} title="You are here" />}
      </MapView>

      <View style={styles.overlay}>
        <View style={styles.badgeContainer}>
          {location ? (
            <Text style={styles.badge}>● LIVE</Text>
          ) : (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#ef4444" />
              <Text style={styles.loadingBadgeText}>Getting GPS fix...</Text>
            </View>
          )}
        </View>

        <View style={styles.viewerBadge}>
          <Text style={styles.viewerBadgeText}>
            {viewerCount} {viewerCount === 1 ? 'viewer' : 'viewers'} watching
          </Text>
        </View>

        <TouchableOpacity style={styles.stopButton} onPress={onStop}>
          <Text style={styles.buttonText}>Stop Sharing</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { position: 'absolute', top: 60, alignSelf: 'center', alignItems: 'center', width: '100%' },
  badgeContainer: { backgroundColor: 'rgba(255,255,255,0.9)', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  badge: { color: 'red', fontWeight: 'bold' },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },
  loadingBadgeText: { marginLeft: 6, color: '#555', fontWeight: '600' },
  viewerBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  viewerBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  stopButton: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    padding: 15,
    borderRadius: 10,
    marginTop: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    elevation: 5,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
});