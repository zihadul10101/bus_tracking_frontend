import { LiveRoomData, locationService } from '@/src/services/locationService';
import { useRouter } from 'expo-router';
import { Bus } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function ActiveTripsList() {
  const router = useRouter();
  const [trips, setTrips] = useState<LiveRoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  // রিফ্রেশ করার ফাংশন
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTrips();
    setRefreshing(false);
  }, []);

  const fetchTrips = async () => {
    try {
      setError(null);
      // ✅ locationService ব্যবহার করা হচ্ছে — auth headers + non-JSON response handling এখন api.ts এর interceptor-এ
      const data = await locationService.getAllLiveRooms();
      if (data.success) {
        setTrips(data.activeRooms);
      }
    } catch (err: any) {
      console.error("Error:", err);
      // ✅ api.ts এর response interceptor থেকে আসা user-friendly মেসেজ প্রাধান্য পাবে
      setError(err.userMessage || err.message || 'সার্ভারে কানেক্ট করা যাচ্ছে না।');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: LiveRoomData }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Bus size={24} color="#3b82f6" />
        <View style={{ marginLeft: 15 }}>
          <Text style={styles.busName}>{item.busName}</Text>
          <Text style={styles.busNo}>Bus No: {item.busNo}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push({
          pathname: "/(tabs)/live-trips/[busId]",
          params: { busId: item.busId }
        } as any)}
      >
        <Text style={styles.buttonText}>Track Live</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  // ✅ basic error state so a failed fetch isn't just a silent empty list
  if (error && trips.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Active Buses</Text>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#ef4444', marginBottom: 12, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity onPress={() => { setLoading(true); fetchTrips(); }}>
            <Text style={{ color: '#3b82f6', fontWeight: '700' }}>আবার চেষ্টা করুন</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Buses</Text>
      <FlatList
        data={trips}
        renderItem={renderItem}
        keyExtractor={(item) => item.busId}
        // এখানে রিফ্রেশ কন্ট্রোল যোগ করা হয়েছে
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<Text style={styles.empty}>No active trips found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1e293b' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 3 },
  cardInfo: { flexDirection: 'row', alignItems: 'center' },
  busName: { fontSize: 18, fontWeight: '700' },
  busNo: { color: '#64748b' },
  button: { backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});