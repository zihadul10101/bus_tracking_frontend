import { busService } from '@/src/services/busService';
import { Driver, driverService } from '@/src/services/driverService';
import { Bus as BusType } from '@/src/types/bus';
import { router, useNavigation } from 'expo-router';
import { Bus, Calendar, CheckCircle, PencilLine, Plus, Trash2, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DriversList() {
  const [list, setList] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [buses, setBuses] = useState<BusType[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [assigning, setAssigning] = useState<boolean>(false);

  const navigation = useNavigation();

  const fetchDrivers = (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);
    return driverService.getAll()
      .then((res: any) => {
        let driversData = res.success && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        const activeDrivers = driversData.filter((d: any) => d && !d.isDeleted);
        setList(activeDrivers);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch Drivers Error:", err);
        Alert.alert("Error", "Could not fetch drivers.");
        setLoading(false);
      });
  };

  const fetchAllBuses = async () => {
    try {
      const res = await busService.getAllBuses();

      if (res && res.success && Array.isArray(res.data)) {
        setBuses(res.data);
      } else if (Array.isArray(res)) {
        setBuses(res);
      }
    } catch (error) {
      console.error("Fetch Buses Error:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDrivers(false);
      fetchAllBuses();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchDrivers(true);
    fetchAllBuses();
  }, []);

  // 🔽 Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchDrivers(false), fetchAllBuses()]);
    } catch (err) {
      console.warn("Drivers List Refresh Error:", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleAssignBus = async (busId: string, busName: string) => {
    if (!selectedDriver) return;

    try {
      setAssigning(true);

      const res = await driverService.assignBus(selectedDriver._id, busId);
      console.log("🎯 Assign Bus API Response:", res);

      if (res && res.success) {
        Alert.alert("Success", `Assigned to ${busName} successfully!`);
        setModalVisible(false);
        setTimeout(() => {
          setSelectedDriver(null);
          fetchDrivers(false);
          fetchAllBuses();
        }, 150);
      } else {
        Alert.alert("Failed", res.message || "Failed to update database.");
      }
    } catch (error: any) {
      console.error("Handle Assign Bus Error:", error);
      Alert.alert("Error", error?.response?.data?.message || "Failed to assign bus.");
    } finally {
      setAssigning(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Confirm Delete", `Are you sure you want to delete Driver: ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await driverService.delete(id);
            Alert.alert("Success", "Driver deleted successfully");
            fetchDrivers(false);
          } catch (error) {
            Alert.alert("Error", "Failed to delete driver");
          }
        }
      }
    ]);
  };

  const renderBusInfo = (busIdField: any) => {
    if (!busIdField) return 'No Bus Assigned';

    if (typeof busIdField === 'object' && busIdField.busName) {
      return `${busIdField.busName} (${busIdField.busNo || 'N/A'})`;
    }

    const lookupId = typeof busIdField === 'object' ? busIdField._id : busIdField;
    if (lookupId) {
      const matchedBus = buses.find(b => b._id === lookupId);
      return matchedBus ? `${matchedBus.busName} (${matchedBus.busNo})` : `Assigned`;
    }

    return 'Assigned';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(tabs)/drivers/create')}>
        <Plus size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add New Driver</Text>
      </TouchableOpacity>

      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No Drivers Found</Text>}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563eb"
            colors={['#2563eb']}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              onPress={() => {
                setSelectedDriver(item);
                setModalVisible(true);
              }}
              style={styles.infoContainer}
              activeOpacity={0.7}
            >
              <View style={styles.nameRow}>
                <Text style={styles.nameText}>{item.name}</Text>
                <View style={[styles.statusDot, { backgroundColor: item.isOnline ? '#22c55e' : '#cbd5e1' }]} />
              </View>

              <Text style={styles.subText}>Mobile: {item.mobile}</Text>
              <Text style={styles.subText}>License: {item.licenseNumber}</Text>

              <View style={styles.badgeContainer}>
                <Bus size={14} color="#2563eb" />
                <Text style={styles.badge}>{renderBusInfo(item.busId)}</Text>
                <Text style={styles.clickHint}>• Click to Assign Bus</Text>
              </View>

              <View style={styles.timeContainer}>
                <Calendar size={12} color="#94a3b8" />
                <Text style={styles.timeText}>Joined: {formatDate(item.createdAt)}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.actionsContainer}>
              <TouchableOpacity onPress={() => router.push(`/(tabs)/drivers/${item._id}`)} style={[styles.actionButton, styles.editBtn]}>
                <PencilLine size={18} color="#2563eb" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item._id, item.name)} style={[styles.actionButton, styles.deleteBtn]}>
                <Trash2 size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Assign Bus</Text>
                <Text style={styles.modalSubtitle}>Driver: {selectedDriver?.name}</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {assigning ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={{ marginTop: 10, color: '#475569' }}>Linking Driver & Bus...</Text>
              </View>
            ) : (
              <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                {buses.length === 0 ? (
                  <Text style={styles.emptyText}>No Buses Available In Database</Text>
                ) : (
                  buses.map((bus) => {
                    const isCurrentBus =
                      (selectedDriver?.busId === bus._id) ||
                      (typeof selectedDriver?.busId === 'object' && (selectedDriver?.busId as any)?._id === bus._id);

                    return (
                      <TouchableOpacity
                        key={bus._id}
                        style={[styles.busItem, isCurrentBus && styles.activeBusItem]}
                        onPress={() => handleAssignBus(bus._id, bus.busName)}
                        activeOpacity={0.7}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <View style={[styles.busIconContainer, isCurrentBus && { backgroundColor: '#dbeafe' }]}>
                            <Bus size={20} color={isCurrentBus ? '#2563eb' : '#64748b'} />
                          </View>
                          <View>
                            <Text style={styles.busNameText}>{bus.busName}</Text>
                            <Text style={styles.busNoText}>Bus No: {bus.busNo}</Text>
                          </View>
                        </View>
                        {isCurrentBus && <CheckCircle size={20} color="#22c55e" />}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#64748b', fontSize: 15 },
  addButton: {
    flexDirection: 'row', backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 1.41,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
  },
  infoContainer: { flex: 1, paddingRight: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  nameText: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  subText: { fontSize: 13, color: '#64748b', marginTop: 1 },
  badgeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  badge: { fontSize: 12, fontWeight: '600', color: '#2563eb', backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  clickHint: { fontSize: 11, color: '#94a3b8', fontStyle: 'italic' },
  timeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  timeText: { fontSize: 11, color: '#94a3b8' },
  actionsContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionButton: { padding: 8, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  editBtn: { backgroundColor: '#eff6ff' },
  deleteBtn: { backgroundColor: '#fef2f2' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, maxHeight: '75%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  modalSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  closeButton: { padding: 4, backgroundColor: '#f1f5f9', borderRadius: 20 },
  modalLoading: { padding: 40, justifyContent: 'center', alignItems: 'center' },
  busItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, marginTop: 12 },
  activeBusItem: { borderColor: '#2563eb', backgroundColor: '#f0fdf4' },
  busIconContainer: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 8 },
  busNameText: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  busNoText: { fontSize: 12, color: '#64748b', marginTop: 1 }
});