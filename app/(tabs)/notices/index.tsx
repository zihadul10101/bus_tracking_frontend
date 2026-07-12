import { noticeService } from '@/src/services/noticeService';
import { router, useNavigation } from 'expo-router';
import { Calendar, Edit3, Megaphone, Plus, ShieldAlert, Trash2, Truck, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NoticeData {
  _id: string;
  title: string;
  message: string;
  type: string;
  createdAt?: string;
}

export default function NoticeList() {
  const [notices, setNotices] = useState<NoticeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const navigation = useNavigation();

  const fetchNotices = (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);
    noticeService.getAllNotices()
      .then((res: any) => {
        if (res && res.success && Array.isArray(res.data)) {
          setNotices(res.data);
        } else if (Array.isArray(res)) {
          setNotices(res);
        }
      })
      .catch((err: any) => {
        console.error("Fetch Notices Error:", err);
        // ✅ api.ts এর response interceptor থেকে আসা user-friendly মেসেজ প্রাধান্য পাবে
        Alert.alert("Error", err.userMessage || err.message || "Could not fetch notices.");
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchNotices(false);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchNotices(true);
  }, []);

  const handleDeleteNotice = (id: string, title: string) => {
    Alert.alert("Confirm Delete", `Are you sure you want to delete this notice?\n"${title}"`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await noticeService.deleteNotice(id);
            Alert.alert("Success", "Notice deleted successfully");
            fetchNotices(false);
          } catch (err: any) {
            Alert.alert("Error", err.userMessage || err.message || "Failed to delete notice");
          }
        }
      }
    ]);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getNoticeTheme = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'urgent': return { icon: <ShieldAlert size={18} color="#ef4444" />, bg: '#fee2e2', text: '#ef4444' };
      case 'student': return { icon: <Users size={18} color="#2563eb" />, bg: '#dbeafe', text: '#2563eb' };
      case 'driver': return { icon: <Truck size={18} color="#d97706" />, bg: '#fef3c7', text: '#d97706' };
      default: return { icon: <Megaphone size={18} color="#475569" />, bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotices(false); }} colors={["#2563eb"]} />
      }
    >
      <View style={styles.mainContentWrapper}>

        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(tabs)/notices/create')}>
          <Plus size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add New Notice</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>সব নোটিশসমূহ ({notices.length})</Text>

        {loading ? (
          <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>নোটিশ লোড হচ্ছে...</Text>
          </View>
        ) : notices.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>কোনো নোটিশ পাওয়া যায়নি।</Text>
          </View>
        ) : (
          notices.map((item) => {
            const theme = getNoticeTheme(item.type);
            return (
              <View key={item._id} style={styles.card}>
                <View style={styles.infoContainer}>
                  <View style={styles.titleRow}>
                    <View style={styles.iconWrapper}>{theme.icon}</View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={styles.titleText} numberOfLines={1}>{item.title}</Text>
                      <View style={[styles.typeBadge, { backgroundColor: theme.bg }]}>
                        <Text style={[styles.typeBadgeText, { color: theme.text }]}>{item.type || 'General'}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.messageText} numberOfLines={2}>{item.message}</Text>

                  <View style={styles.timeContainer}>
                    <Calendar size={12} color="#94a3b8" />
                    <Text style={styles.timeText}>Published: {formatDate(item.createdAt)}</Text>
                  </View>
                </View>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    onPress={() => router.push(`/(tabs)/notices/view-${item._id}` as any)}
                    style={[styles.actionButton, styles.editBtn]}
                  >
                    <Edit3 size={16} color="#2563eb" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeleteNotice(item._id, item.title)}
                    style={[styles.actionButton, styles.deleteBtn]}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  contentContainer: { paddingBottom: 40 },
  mainContentWrapper: { marginTop: 10, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 12 },
  addButton: {
    flexDirection: 'row', backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 1.41,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  centerLoader: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 12, color: '#64748b', marginTop: 8 },
  emptyBox: { padding: 40, alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  emptyText: { color: '#94a3b8', fontSize: 13, textAlign: 'center' },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff',
    padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05,
  },
  infoContainer: { flex: 1, paddingRight: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  iconWrapper: { marginTop: 2 },
  titleText: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  typeBadge: { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6, marginTop: 2 },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  messageText: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18, paddingLeft: 28 },
  timeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 4, paddingLeft: 28 },
  timeText: { fontSize: 11, color: '#94a3b8' },
  actionsContainer: { flexDirection: 'column', gap: 8, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#f1f5f9', paddingLeft: 12 },
  actionButton: { padding: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  editBtn: { backgroundColor: '#eff6ff' },
  deleteBtn: { backgroundColor: '#fef2f2' }
});