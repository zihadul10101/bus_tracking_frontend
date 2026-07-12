import { locationService, socket } from '@/src/services/locationService';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Bus, MapPin, Users } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';


export default function LiveMap() {
  const { busId } = useLocalSearchParams<{ busId: string }>();
  const navigation = useNavigation();
  const [location, setLocation] = useState<any>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!busId) return;
    setIsLoading(true);


    const fetchInitialStatus = async () => {
      try {
        const result = await locationService.getRoomStatus(busId);
        if (result.success && result.data) {
          setLocation((prev: any) => ({
            ...prev,
            busName: result.data.busName,
            busNo: result.data.busNo,
            lastLocation: result.data.lastLocation ?? prev?.lastLocation,
            isLive: result.data.isLive ?? prev?.isLive,
          }));
          if (result.data.lastLocation) {
            setIsLoading(false);
          }
        }
      } catch (err: any) {
        // ✅ api.ts এর response interceptor থেকে আসা user-friendly মেসেজ প্রাধান্য পাবে
        console.log('Initial room status fetch failed:', err.userMessage || err.message);
      }
    };
    fetchInitialStatus();


    const handleSnapshot = (data: any) => {
      if (data.roomId !== busId) return;
      setLocation({
        busName: data.busInfo?.busName ?? 'Unknown Bus',
        busNo: data.busInfo?.busNo ?? 'N/A',
        lastLocation: data.lastLocation,
        isLive: data.isLive,
      });
      setViewerCount(data.viewerCount ?? 0);
      setIsLoading(false);
    };

    const handleDriverOnline = (data: any) => {
      if (data.roomId !== busId) return;
      setLocation((prev: any) => ({
        ...prev,
        busName: data.busInfo?.busName ?? prev?.busName,
        busNo: data.busInfo?.busNo ?? prev?.busNo,
        isLive: true,
      }));
      setIsLoading(false);
    };

    const handleLocationBroadcast = (data: any) => {
      if (data.roomId !== busId) return;
      setLocation((prev: any) => ({
        ...(prev ?? {}),
        lastLocation: { latitude: data.latitude, longitude: data.longitude },
        isLive: true,
      }));
      setViewerCount(data.viewerCount ?? 0);
      setIsLoading(false);

      mapRef.current?.animateToRegion(
        {
          latitude: data.latitude,
          longitude: data.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );
    };

    const handleDriverOffline = (data: any) => {
      if (data.roomId && data.roomId !== busId) return;
      Alert.alert('Trip Ended', 'The bus has currently stopped live tracking.');
      navigation.goBack();
    };

    const handleViewerCount = (data: any) => {
      if (data.roomId !== busId) return;
      setViewerCount(data.count ?? 0);
    };

    socket.on('trip-snapshot', handleSnapshot);
    socket.on('driver-online', handleDriverOnline);
    socket.on('location-broadcast', handleLocationBroadcast);
    socket.on('driver-offline', handleDriverOffline);
    socket.on('viewer-count', handleViewerCount);

    socket.emit('join-room', { roomId: busId, role: 'student' });

    const timeout = setTimeout(() => setIsLoading(false), 5000);

    return () => {
      clearTimeout(timeout);
      socket.off('trip-snapshot', handleSnapshot);
      socket.off('driver-online', handleDriverOnline);
      socket.off('location-broadcast', handleLocationBroadcast);
      socket.off('driver-offline', handleDriverOffline);
      socket.off('viewer-count', handleViewerCount);

      socket.emit('leave-room', busId);
    };
  }, [busId]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isOnline = location?.isLive && location?.lastLocation;

  return (
    <View style={styles.container}>
      {isOnline ? (
        <>
          <View style={styles.card}>
            <Text style={styles.header}>Live Tracking</Text>
            <View style={styles.infoRow}>
              <Bus size={18} color="#666" />
              <Text> {location.busName} ({location.busNo})</Text>
            </View>
            <View style={styles.infoRow}>
              <Users size={16} color="#666" />
              <Text> {viewerCount} watching</Text>
            </View>
          </View>

          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location.lastLocation.latitude,
              longitude: location.lastLocation.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.lastLocation.latitude,
                longitude: location.lastLocation.longitude,
              }}
              title={location.busName}
            />
          </MapView>
        </>
      ) : (
        <View style={styles.center}>
          <MapPin size={64} color="#94a3b8" />
          <Text style={styles.emptyTitle}>Trip not found or offline</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', padding: 20, margin: 15, borderRadius: 15, elevation: 5, zIndex: 1 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  map: { flex: 1, marginTop: -10 },
  emptyTitle: { fontSize: 18, marginTop: 15, color: '#64748b' },
});