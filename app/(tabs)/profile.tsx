import RefreshContainer from '@/components/RefreshContainer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';

interface UserData {
  _id?: string;
  name: string;
  email?: string;
  role: 'super_admin' | 'sub_admin' | 'student' | 'driver';
  departmentName?: string;
  mobileNumber?: string;
  mobile?: string;
  licenseNumber?: string;
  loginName?: string;
  isOnline?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  busId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  permissions?: {
    canManageBuses: boolean;
    canPostNotices: boolean;
    canManageStudents: boolean;
    canViewTracking: boolean;
  };
}

export default function Profile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const storedData = await AsyncStorage.getItem('userData');
    
      
      if (storedData) {
        setUser(JSON.parse(storedData));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  if (loading) {
    return (
      <View style={styles.centerLoader}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin': return { text: '⚡ Super Admin', color: '#ef4444', bg: '#fef2f2', border: '#fca5a5' };
      case 'sub_admin': return { text: '🛡️ Sub Admin', color: '#f59e0b', bg: '#fffbbf', border: '#fde047' };
      case 'student': return { text: '🎓 Student', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' };
      case 'driver': return { text: '🚌 Driver', color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' };
      default: return { text: 'ইউজার', color: '#64748b', bg: '#f8fafc', border: '#cbd5e1' };
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const badge = getRoleBadge(user?.role || '');

  return (
    <RefreshContainer
      onRefreshAction={fetchUserData}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerSpacer} />

      {/* 👤 প্রোফাইল কার্ড */}
      <View style={styles.profileCard}>
        <View style={[styles.avatarCircle, { backgroundColor: badge.color }]}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'ব্যবহারকারীর নাম'}</Text>
        <View style={[styles.roleBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
          <Text style={[styles.roleBadgeText, { color: badge.color }]}>{badge.text}</Text>
        </View>
      </View>

      {/* 📝 প্রোফাইল ডিটেইলস */}
      <Text style={styles.sectionTitle}>Profile Details</Text>
      <View style={styles.infoContainer}>

        {/* সব role এর জন্য কমন */}
        {user?.email && (
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>📧 Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        )}

        {/* --- Student --- */}
        {user?.role === 'student' && (
          <>
            {user?.departmentName && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>🏛️ Department Name</Text>
                <Text style={styles.infoValue}>{user.departmentName}</Text>
              </View>
            )}
            {user?.mobileNumber && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>📱 Mobile Number</Text>
                <Text style={styles.infoValue}>{user.mobileNumber}</Text>
              </View>
            )}
          </>
        )}

        {/* --- Driver --- */}
        {user?.role === 'driver' && (
          <>
            {user?.loginName && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>👤 লগইন নেম</Text>
                <Text style={styles.infoValue}>{user.loginName}</Text>
              </View>
            )}
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>📱 মোবাইল</Text>
              <Text style={styles.infoValue}>{user.mobile || 'N/A'}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>🪪 লাইসেন্স নাম্বার</Text>
              <Text style={styles.infoValue}>{user.licenseNumber || 'N/A'}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>🚌 বাস আইডি</Text>
              <Text style={styles.infoValue}>{user.busId || 'বরাদ্দ হয়নি'}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>🟢 স্ট্যাটাস</Text>
              <Text style={[styles.infoValue, { color: user.isOnline ? '#10b981' : '#ef4444' }]}>
                {user.isOnline ? 'অনলাইন' : 'অফলাইন'}
              </Text>
            </View>
          </>
        )}

        {/* --- Super Admin / Sub Admin --- */}
        {(user?.role === 'super_admin' || user?.role === 'sub_admin') && (
          <>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>✅ Account Status</Text>
              <Text style={[styles.infoValue, { color: user.isActive ? '#10b981' : '#ef4444' }]}>
                {user.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
              </Text>
            </View>

            {user?.permissions && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>🔑 Permission</Text>
                <View style={styles.permissionRow}>
                  {user.permissions.canManageBuses && <Text style={styles.permissionChip}>বাস ম্যানেজ</Text>}
                  {user.permissions.canPostNotices && <Text style={styles.permissionChip}>নোটিশ পোস্ট</Text>}
                  {user.permissions.canManageStudents && <Text style={styles.permissionChip}>স্টুডেন্ট ম্যানেজ</Text>}
                  {user.permissions.canViewTracking && <Text style={styles.permissionChip}>ট্র্যাকিং দেখা</Text>}
                </View>
              </View>
            )}
          </>
        )}

        {/* কমন: যোগদানের তারিখ */}
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>📅 Date of Joining</Text>
          <Text style={styles.infoValue}>{formatDate(user?.createdAt)}</Text>
        </View>
      </View>
    </RefreshContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  headerSpacer: { height: Platform.OS === 'ios' ? 20 : 50 },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1.5, borderColor: '#e2e8f0', marginBottom: 24 },
  avatarCircle: { width: 84, height: 84, borderRadius: 42, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 34, fontWeight: 'bold' },
  userName: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  roleBadge: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  roleBadgeText: { fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 12 },
  infoContainer: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1.5, borderColor: '#e2e8f0', overflow: 'hidden' },
  infoBox: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  infoLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  infoValue: { fontSize: 14, color: '#1e293b', fontWeight: '700', marginTop: 4 },
  permissionRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 6 },
  permissionChip: {
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  logoutButton: { backgroundColor: '#fef2f2', borderWidth: 1.5, borderColor: '#fca5a5', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  logoutButtonText: { color: '#ef4444', fontSize: 15, fontWeight: '700' },
});