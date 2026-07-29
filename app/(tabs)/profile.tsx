import RefreshContainer from '@/components/RefreshContainer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Bus as BusIcon,
  Calendar,
  GraduationCap,
  IdCard,
  Mail,
  Phone,
  Shield
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';

interface BusData {
  _id?: string;
  busName?: string;
  busNo?: string;
  capacity?: number;
  status?: string;
}

interface UserData {
  _id?: string;
  name: string;
  email?: string;
  role: 'super_admin' | 'sub_admin' | 'student' | 'driver';
  departmentName?: string;
  studentId?: string;
  isVerified?: boolean;
  mobileNumber?: string;
  mobile?: string;
  licenseNumber?: string;
  loginName?: string;
  isOnline?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  busId?: string | null;
  bus?: BusData | null;
  createdAt?: string;
  updatedAt?: string;
  permissions?: {
    canManageBuses: boolean;
    canPostNotices: boolean;
    canManageStudents: boolean;
    canViewTracking: boolean;
  };
}

const ROLE_THEME: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  super_admin: { color: '#ef4444', bg: '#fef2f2', label: 'Super Admin', icon: '⚡' },
  sub_admin: { color: '#f59e0b', bg: '#fffbeb', label: 'Sub Admin', icon: '🛡️' },
  student: { color: '#3b82f6', bg: '#eff6ff', label: 'Student', icon: '🎓' },
  driver: { color: '#10b981', bg: '#f0fdf4', label: 'Driver', icon: '🚌' },
};

export default function Profile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  console.log("user",user);
  
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
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const theme = ROLE_THEME[user?.role || ''] || ROLE_THEME.student;
  const assignedBus = user?.bus;

  return (
    <RefreshContainer
      onRefreshAction={fetchUserData}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerSpacer} />

      {/* 👤 প্রোফাইল কার্ড */}
      <View style={styles.profileCard}>
        <View style={[styles.avatarCircle, { backgroundColor: theme.color }]}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
          {user?.role === 'driver' && (
            <View style={[styles.onlineDot, { backgroundColor: user.isOnline ? '#22c55e' : '#94a3b8' }]} />
          )}
        </View>

        <Text style={styles.userName}>{user?.name || 'ব্যবহারকারীর নাম'}</Text>

        <View style={[styles.roleBadge, { backgroundColor: theme.bg }]}>
          <Text style={styles.roleBadgeEmoji}>{theme.icon}</Text>
          <Text style={[styles.roleBadgeText, { color: theme.color }]}>{theme.label}</Text>
        </View>

        {/* {user?.role === 'student' && (
          <View style={styles.verifyRow}>
            {user.isVerified ? (
              <ShieldCheck size={14} color="#10b981" />
            ) : (
              <Shield size={14} color="#f59e0b" />
            )}
            <Text style={[styles.verifyText, { color: user.isVerified ? '#10b981' : '#f59e0b' }]}>
              {user.isVerified ? 'ভেরিফায়েড অ্যাকাউন্ট' : 'ভেরিফিকেশন বাকি আছে'}
            </Text>
          </View>
        )} */}
      </View>

      {/* 🎓 স্টুডেন্ট আইডি */}
      {user?.role === 'student' && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: theme.bg }]}>
              <IdCard size={20} color={theme.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>স্টুডেন্ট আইডি</Text>
              <Text style={styles.cardValue} numberOfLines={1}>
                {user.studentId || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardFooterRow}>
            <GraduationCap size={15} color="#64748b" />
            <Text style={styles.cardFooterText} numberOfLines={1}>
              {user.departmentName || 'বিভাগ উল্লেখ নেই'}
            </Text>
          </View>
        </View>
      )}

      {/* 🚌 বাস অ্যাসাইনমেন্ট */}
      {user?.role === 'driver' && (
        <View style={styles.card}>
          {assignedBus ? (
            <>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconWrap, { backgroundColor: theme.bg }]}>
                  <BusIcon size={20} color={theme.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardLabel}>বরাদ্দকৃত বাস</Text>
                  <Text style={styles.cardValue} numberOfLines={1}>
                    {assignedBus.busName || 'নাম নেই'}
                  </Text>
                </View>
                {assignedBus.status && (
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: assignedBus.status === 'active' ? '#f0fdf4' : '#fef2f2' },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: assignedBus.status === 'active' ? '#10b981' : '#ef4444' },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: assignedBus.status === 'active' ? '#166534' : '#991b1b' },
                      ]}
                    >
                      {assignedBus.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.busStatsRow}>
                <View style={styles.busStatItem}>
                  <Text style={styles.busStatLabel}>বাস নম্বর</Text>
                  <Text style={styles.busStatValue}>{assignedBus.busNo || 'N/A'}</Text>
                </View>
                <View style={styles.busStatSeparator} />
                <View style={styles.busStatItem}>
                  <Text style={styles.busStatLabel}>ধারণক্ষমতা</Text>
                  <Text style={styles.busStatValue}>
                    {typeof assignedBus.capacity === 'number' ? `${assignedBus.capacity} সিট` : 'N/A'}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noBusRow}>
              <View style={styles.noBusIconWrap}>
                <BusIcon size={20} color="#94a3b8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.noBusTitle}>কোনো বাস বরাদ্দ হয়নি</Text>
                <Text style={styles.noBusSubtitle}>এডমিনের সাথে যোগাযোগ করুন</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* 📝 প্রোফাইল ডিটেইলস */}
      <Text style={styles.sectionTitle}>প্রোফাইল বিবরণ</Text>

      <View style={styles.infoContainer}>
        {user?.email && (
          <View style={styles.infoRow}>
            <View style={[styles.infoIconWrap, { backgroundColor: '#eff6ff' }]}>
              <Mail size={16} color="#3b82f6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>ইমেইল</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>
        )}

        {user?.role === 'student' && user?.mobileNumber && (
          <View style={styles.infoRow}>
            <View style={[styles.infoIconWrap, { backgroundColor: '#f0fdf4' }]}>
              <Phone size={16} color="#10b981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>মোবাইল নম্বর</Text>
              <Text style={styles.infoValue}>{user.mobileNumber}</Text>
            </View>
          </View>
        )}

        {user?.role === 'driver' && (
          <>
            {user?.loginName && (
              <View style={styles.infoRow}>
                <View style={[styles.infoIconWrap, { backgroundColor: '#eff6ff' }]}>
                  <IdCard size={16} color="#3b82f6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>লগইন নেম</Text>
                  <Text style={styles.infoValue}>{user.loginName}</Text>
                </View>
              </View>
            )}
            <View style={styles.infoRow}>
              <View style={[styles.infoIconWrap, { backgroundColor: '#f0fdf4' }]}>
                <Phone size={16} color="#10b981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>মোবাইল</Text>
                <Text style={styles.infoValue}>{user.mobile || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={[styles.infoIconWrap, { backgroundColor: '#fef3c7' }]}>
                <IdCard size={16} color="#d97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>লাইসেন্স নম্বর</Text>
                <Text style={styles.infoValue}>{user.licenseNumber || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View
                style={[styles.infoIconWrap, { backgroundColor: user.isOnline ? '#f0fdf4' : '#fef2f2' }]}
              >
                <View style={[styles.miniDot, { backgroundColor: user.isOnline ? '#10b981' : '#ef4444' }]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>স্ট্যাটাস</Text>
                <Text style={[styles.infoValue, { color: user.isOnline ? '#10b981' : '#ef4444' }]}>
                  {user.isOnline ? 'অনলাইন' : 'অফলাইন'}
                </Text>
              </View>
            </View>
          </>
        )}

        {(user?.role === 'super_admin' || user?.role === 'sub_admin') && (
          <>
            <View style={styles.infoRow}>
              <View
                style={[styles.infoIconWrap, { backgroundColor: user.isActive ? '#f0fdf4' : '#fef2f2' }]}
              >
                <View style={[styles.miniDot, { backgroundColor: user.isActive ? '#10b981' : '#ef4444' }]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>অ্যাকাউন্ট স্ট্যাটাস</Text>
                <Text style={[styles.infoValue, { color: user.isActive ? '#10b981' : '#ef4444' }]}>
                  {user.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </Text>
              </View>
            </View>

            {user?.permissions && (
              <View style={styles.infoRow}>
                <View style={[styles.infoIconWrap, { backgroundColor: '#fef3c7' }]}>
                  <Shield size={16} color="#d97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>পারমিশন</Text>
                  <View style={styles.permissionRow}>
                    {user.permissions.canManageBuses && <Text style={styles.permissionChip}>বাস ম্যানেজ</Text>}
                    {user.permissions.canPostNotices && <Text style={styles.permissionChip}>নোটিশ পোস্ট</Text>}
                    {user.permissions.canManageStudents && <Text style={styles.permissionChip}>স্টুডেন্ট ম্যানেজ</Text>}
                    {user.permissions.canViewTracking && <Text style={styles.permissionChip}>ট্র্যাকিং দেখা</Text>}
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <View style={[styles.infoIconWrap, { backgroundColor: '#f5f3ff' }]}>
            <Calendar size={16} color="#8b5cf6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>যোগদানের তারিখ</Text>
            <Text style={styles.infoValue}>{formatDate(user?.createdAt)}</Text>
          </View>
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

  // Profile card
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: { fontSize: 19, fontWeight: '700', color: '#1e293b' },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  roleBadgeEmoji: { fontSize: 12 },
  roleBadgeText: { fontSize: 12, fontWeight: '700' },
  verifyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 5 },
  verifyText: { fontSize: 12, fontWeight: '600' },

  // ID / Bus card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  cardValue: { fontSize: 17, color: '#1e293b', fontWeight: '700', marginTop: 2 },
  cardDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  cardFooterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardFooterText: { fontSize: 13, color: '#475569', fontWeight: '600', flex: 1 },

  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusPillText: { fontSize: 11, fontWeight: '700' },

  busStatsRow: { flexDirection: 'row', alignItems: 'center' },
  busStatItem: { flex: 1 },
  busStatSeparator: { width: 1, height: 30, backgroundColor: '#e2e8f0', marginHorizontal: 12 },
  busStatLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginBottom: 3 },
  busStatValue: { fontSize: 15, color: '#1e293b', fontWeight: '700' },

  noBusRow: { flexDirection: 'row', alignItems: 'center' },
  noBusIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noBusTitle: { fontSize: 14, color: '#475569', fontWeight: '700' },
  noBusSubtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 },

  // Info list
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 10, marginLeft: 2 },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  miniDot: { width: 9, height: 9, borderRadius: 5 },
  infoLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  infoValue: { fontSize: 14, color: '#1e293b', fontWeight: '700', marginTop: 3 },
  permissionRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
  permissionChip: {
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
});