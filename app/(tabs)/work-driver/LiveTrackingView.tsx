import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface Props {
  location: { latitude: number; longitude: number } | null;
  onStop: () => void;
  viewerCount?: number;
}

export default function LiveTrackingView({ location, onStop, viewerCount = 0 }: Props) {
  const mapRef = useRef<MapView>(null);

  // Smoothly move the map when location updates
  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        ...location,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  }, [location]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: location?.latitude || 22.3569,
          longitude: location?.longitude || 91.7832,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        // Prevents map elements from being hidden by overlays
        mapPadding={{ top: 120, left: 0, right: 0, bottom: 0 }}
      >
        {location && <Marker coordinate={location} pinColor="red" title="You are here" />}
      </MapView>

      <SafeAreaView style={styles.overlay}>
        {/* Status Header */}
        <View style={styles.topContainer}>
          <View style={[styles.badge, location ? styles.liveBadge : styles.loadingBadge]}>
            {location ? (
              <Text style={styles.liveText}>● LIVE</Text>
            ) : (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#666" />
                <Text style={styles.loadingText}> Connecting...</Text>
              </View>
            )}
          </View>
          
          <View style={styles.viewerBadge}>
            <Text style={styles.viewerText}>{viewerCount} watching</Text>
          </View>
        </View>

        {/* Action Footer */}
        <TouchableOpacity style={styles.stopButton} onPress={onStop}>
          <Text style={styles.buttonText}>Stop Sharing</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { position: 'absolute', top: 0, width: '100%', paddingHorizontal: 20 },
  topContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  badge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#fff' },
  liveBadge: { borderColor: '#ef4444', borderWidth: 1 },
  loadingBadge: { borderColor: '#ccc', borderWidth: 1 },
  liveText: { color: '#ef4444', fontWeight: '800', fontSize: 12 },
  loadingText: { marginLeft: 6, color: '#555', fontSize: 12 },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },
  viewerBadge: { backgroundColor: 'rgba(0,0,0,0.7)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  viewerText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  stopButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 16,
    marginTop: 'auto',
    marginBottom: 40,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});