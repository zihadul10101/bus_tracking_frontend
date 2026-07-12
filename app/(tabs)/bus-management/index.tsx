import RefreshContainer from '@/components/RefreshContainer';
import { useFocusEffect, useRouter } from 'expo-router';
import { Bus as BusIcon, ChevronRight, Plus, Trash2 } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../constants/colors';
import { busService } from '../../../src/services/busService';
import { Bus } from '../../../src/types/bus';


export default function BusListScreen() {
  const router = useRouter();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);


  const fetchBuses = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const res = await busService.getAllBuses();

      if (Array.isArray(res)) setBuses(res);
      else if (res && Array.isArray(res.data)) setBuses(res.data);
      else setBuses([]);
    } catch (err: any) {
      Alert.alert('Error', err.userMessage || err.message || 'Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ বাস ডিলিট করার ফাংশন
  const deleteBusDirectly = async (busId: string) => {
    try {
      await busService.deleteBus(busId);
      Alert.alert('Success', 'Bus deleted successfully');
      fetchBuses(false); // ডিলিটের পর ব্যাকগ্রাউন্ডে লিস্ট আপডেট
    } catch (err: any) {
      Alert.alert('Error', err.userMessage || err.message || 'Failed to delete bus');
    }
  };

  // 🎯 স্ক্রিনে ফোকাস আসলে অটোমেটিক ডাটা রিফ্রেশ
useFocusEffect(
  useCallback(() => {
    fetchBuses(false); // always background refresh — spinner শুধু প্রথমবার (initial state loading=true থেকে) দেখাবে
  }, [])
);

  const handleDelete = (busId: string, busNo: string) => {
    Alert.alert("Delete Bus", `Are you sure you want to delete bus ${busNo}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteBusDirectly(busId) },
    ]);
  };

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />;
  }

  return (
    // 🎯 ১. পুরো স্ক্রিনটিকে আপনার Reusable RefreshContainer দিয়ে মুড়িয়ে দিন
    // এবং onRefreshAction-এ ডাটা ফেচিং মেথডটি পাস করুন
    <RefreshContainer onRefreshAction={() => fetchBuses(false)}>
      <View style={styles.container}>
        
        {/* হেডার সেকশন */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Active Fleet ({buses.length})</Text>
          <TouchableOpacity 
            style={styles.addBusHeaderBtn} 
            onPress={() => router.push('/(tabs)/bus-management/create')}
          >
            <Plus size={16} color={colors.primary} />
            <Text style={styles.addBusHeaderText}>Add Bus</Text>
          </TouchableOpacity>
        </View>

        {/* 🎯 ২. এখানে FlatList-এর নিজস্ব scrollEnabled বন্ধ করে দেওয়া হয়েছে 
            যাতে RefreshContainer (ScrollView)-এর সাথে স্ক্রোলিং কনফ্লিক্ট না হয় */}
        <FlatList
          data={buses}
          keyExtractor={(item) => item._id}
          scrollEnabled={false} // 👈 ক্রুশিয়াল পার্ট: স্ক্রোলিং কনফ্লিক্ট এড়ানোর জন্য
          contentContainerStyle={{ paddingBottom: 80 }} 
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <BusIcon size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No buses found in the fleet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push(`/(tabs)/bus-management/${item._id}` as any)}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconContainer}>
                  <BusIcon size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.busName} numberOfLines={1}>{item.busName}</Text>
                  <Text style={styles.busNo}>No: {item.busNo}</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <TouchableOpacity onPress={() => handleDelete(item._id, item.busNo)} style={styles.deleteBtn}>
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
                <ChevronRight size={20} color={'#94a3b8'} />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </RefreshContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 4 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  addBusHeaderBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  addBusHeaderText: { color: colors.primary, fontWeight: '600', marginLeft: 4, fontSize: 14 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { padding: 10, backgroundColor: '#eff6ff', borderRadius: 12, marginRight: 12 },
  busName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  busNo: { fontSize: 14, color: '#64748b', marginTop: 2 },
  cardRight: { flexDirection: 'row', alignItems: 'center' },
  deleteBtn: { padding: 8, marginRight: 4 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 8 },
  emptyText: { fontSize: 15, color: '#64748b', fontWeight: '500' },
});