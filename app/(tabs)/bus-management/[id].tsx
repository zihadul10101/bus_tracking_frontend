import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Clock, Edit, Edit3, MapPin, Plus, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../constants/colors';
import { busService } from '../../../src/services/busService';
import { Bus, Trip } from '../../../src/types/bus';

export default function BusDetailsScreen() {
  const { id } = useLocalSearchParams(); // এটি বাসের ID
  const router = useRouter();
  const [bus, setBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBusDetails = async () => {
    try {
      setLoading(true);
      const res = await busService.getBusById(id as string);
      if (res.success) setBus(res.data);
    } catch (err: any) {
      Alert.alert("Error", err.userMessage || err.message || "Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBusDetails();
  }, [id]);

  // 🚌 ১. বাস এডিট ফাইলে নেভিগেশন (ক্লিন সাব-ফোল্ডার পাথ)
  const handleEditBus = () => {
    router.push(`/(tabs)/bus-management/edit/${id}` as any);
  };

  // 🗺️ ২. ট্রিপ এডিট ফাইলে নেভিগেশন (সঠিক trips/edit পাথ এবং params সহ)
  const handleEditTrip = (trip: Trip) => {
    router.push({
      pathname: '/(tabs)/bus-management/trips/edit',
      params: { 
        busId: id, 
        tripId: trip._id 
      }
    } as any);
  };

  // ➕ ৩. নতুন ট্রিপ ক্রিয়েট স্ক্রিনে নেভিগেশন (স্ট্যাটিক অ্যালার্ট ফিক্সড)
  const handleAddTrip = () => {
    router.push({
      pathname: '/(tabs)/bus-management/trips/create',
      params: { busId: id }
    } as any);
  };

  const handleDeleteTrip = (tripId: string) => {
    Alert.alert("Remove Trip", "Are you sure you want to delete this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await busService.deleteTrip(id as string, tripId);
            if (res.success) {
              Alert.alert("Deleted", "Trip removed successfully");
              fetchBusDetails();
            }
          } catch (err: any) {
            Alert.alert("Error", err.userMessage || err.message || "Failed to delete trip");
          }
        }
      }
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />;
  if (!bus) return <View style={styles.center}><Text>Bus not found</Text></View>;

  return (
    <View style={styles.container}>
      {/* 📋 Bus Meta Summary */}
      <View style={styles.metaCard}>
        <View style={styles.metaMain}>
          <Text style={styles.metaTitle}>{bus.busName}</Text>
          <Text style={styles.metaSubtitle}>Plate No: {bus.busNo}</Text>
        </View>
        
        <TouchableOpacity style={styles.editBusBtn} activeOpacity={0.7} onPress={handleEditBus}>
          <Edit size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Scheduled Trips ({bus.trips?.length || 0})</Text>
        <TouchableOpacity 
          style={styles.addTripBtn}
          onPress={handleAddTrip}
        >
          <Plus size={16} color={colors.primary} />
          <Text style={styles.addTripText}>Add Trip</Text>
        </TouchableOpacity>
      </View>

      {/* 🗺️ Trips List */}
      <FlatList
        data={bus.trips}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.emptyText}>No trips allocated to this bus yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.tripCard}>
            <View style={styles.tripMain}>
              <Text style={styles.tripTitle}>{item.tripTitle}</Text>
              
              <View style={styles.infoRow}>
                <Clock size={14} color="#64748b" style={styles.icon} />
                <Text style={styles.infoText}>{item.from.time} ➔ {item.to.time}</Text>
              </View>

              <View style={styles.infoRow}>
                <MapPin size={14} color="#64748b" style={styles.icon} />
                <Text style={styles.infoText}>{item.from.stop} to {item.to.stop}</Text>
              </View>

              <View style={styles.infoRow}>
                <Calendar size={14} color="#64748b" style={styles.icon} />
                <Text style={styles.infoText} numberOfLines={1}>{item.days.join(', ')}</Text>
              </View>
            </View>
            
            <View style={styles.actionsPanel}>
              <TouchableOpacity onPress={() => handleEditTrip(item)} style={styles.actionBtn}>
                <Edit3 size={18} color={colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => handleDeleteTrip(item._id)} style={styles.actionBtn}>
                <Trash2 size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  metaCard: { backgroundColor: colors.primary, padding: 20, borderRadius: 20, marginBottom: 20, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaMain: { flex: 1 },
  metaTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  metaSubtitle: { fontSize: 14, color: '#bfdbfe', marginTop: 4 },
  editBusBtn: { backgroundColor: '#ffffff', padding: 10, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  addTripBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  addTripText: { color: colors.primary, fontWeight: '600', marginLeft: 4, fontSize: 14 },
  tripCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center', elevation: 1 },
  tripMain: { flex: 1 },
  tripTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  icon: { marginRight: 6 },
  infoText: { fontSize: 13, color: '#475569' },
  actionsPanel: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { padding: 8, marginLeft: 4 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 40, fontSize: 14 }
});