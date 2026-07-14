import { locationService, socket } from '@/src/services/locationService';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Bus, Crosshair, MapPin, Users } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function LiveMap() {
  const { busId } = useLocalSearchParams<{ busId: string }>();
  const navigation = useNavigation();
  const [location, setLocation] = useState<any>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(true); // User-friendly: toggle auto-follow
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!busId) return;

    const fetchInitialStatus = async () => {
      try {
        const result = await locationService.getRoomStatus(busId);
        if (result.success && result.data) {
          setLocation(result.data);
          setIsLoading(false);
        }
      } catch (err: any) {
        setIsLoading(false);
      }
    };

    fetchInitialStatus();

    const handleLocationBroadcast = (data: any) => {
      if (data.roomId !== busId) return;
      
      const newLoc = { latitude: data.latitude, longitude: data.longitude };
      setLocation((prev: any) => ({ ...prev, lastLocation: newLoc, isLive: true }));
      setViewerCount(data.viewerCount ?? 0);
      setIsLoading(false);

      if (isFollowing) {
        mapRef.current?.animateToRegion({
          ...newLoc,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      }
    };

    socket.on('location-broadcast', handleLocationBroadcast);
    socket.emit('join-room', { roomId: busId, role: 'student' });

    return () => {
      socket.off('location-broadcast', handleLocationBroadcast);
      socket.emit('leave-room', busId);
    };
  }, [busId, isFollowing]);

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#3b82f6" /></View>;

  return (
    <View style={styles.container}>
      {location?.lastLocation ? (
        <>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              ...location.lastLocation,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            onPanDrag={() => setIsFollowing(false)} // User stops following when moving map
          >
            <Marker coordinate={location.lastLocation} title={location.busName} />
          </MapView>

          {/* Floating UI Overlay */}
          <View style={styles.floatingCard}>
            <Text style={styles.header}>{location.busName || 'Bus Tracking'}</Text>
            <View style={styles.infoRow}>
              <Bus size={16} color="#666" />
              <Text> {location.busNo || 'N/A'}</Text>
              <View style={styles.dot} />
              <Users size={16} color="#666" />
              <Text> {viewerCount} active</Text>
            </View>
          </View>

          {/* Re-center Button */}
          {!isFollowing && (
            <TouchableOpacity style={styles.fab} onPress={() => setIsFollowing(true)}>
              <Crosshair size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={styles.center}>
          <MapPin size={64} color="#94a3b8" />
          <Text style={styles.emptyTitle}>Bus is currently offline</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  floatingCard: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 30,
    elevation: 5,
  },
  emptyTitle: { fontSize: 16, color: '#64748b', marginTop: 10 },
});