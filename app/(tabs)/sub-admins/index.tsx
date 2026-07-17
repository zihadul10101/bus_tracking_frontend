import { SubAdmin, subAdminService } from '@/src/services/subAdminService';
import { router, useNavigation } from 'expo-router';
import { Clock, PencilLine, ShieldCheck, Trash2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SubAdminsList() {
  const [list, setList] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const navigation = useNavigation();

  const fetchSubAdmins = (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);
    return subAdminService.getAll()
      .then((res: any) => {
        const adminsData = res.data ? res.data : res;
        setList(Array.isArray(adminsData) ? adminsData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSubAdmins(false);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchSubAdmins(true);
  }, []);

  // 🔽 Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchSubAdmins(false);
    } catch (err) {
      console.warn("SubAdmins List Refresh Error:", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await subAdminService.delete(id);
              Alert.alert("Success", "Sub Admin deleted successfully");
              fetchSubAdmins(true);
            } catch (error) {
              Alert.alert("Error", "Failed to delete sub-admin");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#002147" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button title="Add New Sub Admin" onPress={() => router.push('/(tabs)/sub-admins/create')} />

      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#002147"
            colors={['#002147']}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No Sub Admins Found</Text>
        }
        renderItem={({ item }: { item: any }) => (
          <View style={styles.card}>
            
            {/* 📝 বাম পাশে সমস্ত ইনফরমেশন */}
            <TouchableOpacity 
              onPress={() => router.push(`/(tabs)/sub-admins/${item._id}`)}
              style={styles.infoContainer}
              activeOpacity={0.6}
            >
              <Text style={styles.nameText}>{item.name}</Text>
              <Text style={styles.emailText}>{item.email}</Text>

              {/* ⚙️ পারমিশন ব্যাজ সেকশন */}
              <View style={styles.badgeContainer}>
                <ShieldCheck size={14} color="#64748b" style={{ marginRight: 4 }} />
                {item.permissions?.canManageBuses && <Text style={styles.badge}>Buses</Text>}
                {item.permissions?.canManageStudents && <Text style={styles.badge}>Students</Text>}
                {item.permissions?.canPostNotices && <Text style={styles.badge}>Notices</Text>}
                {item.permissions?.canViewTracking && <Text style={styles.badge}>Tracking</Text>}
                {/* যদি কোনো পারমিশন ট্রু না থাকে */}
                {!item.permissions?.canManageBuses && !item.permissions?.canManageStudents && 
                 !item.permissions?.canPostNotices && !item.permissions?.canViewTracking && (
                  <Text style={[styles.badge, { backgroundColor: '#fee2e2', color: '#ef4444' }]}>No Access</Text>
                )}
              </View>

              {/* 🗓️ টাইমস্ট্যাম্প (Created / Updated) */}
              <View style={styles.timeContainer}>
                <Clock size={12} color="#94a3b8" />
                <Text style={styles.timeText}>Created: {formatDate(item.createdAt)}</Text>
                <Text style={styles.timeText}>| Updated: {formatDate(item.updatedAt)}</Text>
              </View>
            </TouchableOpacity>

            {/* ⚙️ ডান পাশের অ্যাকশন বাটনসমূহ */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                onPress={() => router.push(`/(tabs)/sub-admins/${item._id}`)}
                style={styles.actionButton}
              >
                <PencilLine size={18} color="#2563eb" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => handleDelete(item._id, item.name)}
                style={styles.actionButton}
              >
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
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#666' },
  card: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    paddingVertical: 16, 
    paddingHorizontal: 12,
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  infoContainer: { flex: 1, paddingRight: 8 },
  nameText: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  emailText: { fontSize: 13, color: '#64748b', marginTop: 2 },
  
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 8, gap: 6 },
  badge: { 
    fontSize: 11, 
    fontWeight: '600', 
    color: '#0f172a', 
    backgroundColor: '#f1f5f9', 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6 
  },
  
  timeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  timeText: { fontSize: 11, color: '#94a3b8' },

  actionsContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  actionButton: { padding: 6, borderRadius: 8, backgroundColor: '#f8fafc' }
});