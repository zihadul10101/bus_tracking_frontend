
import { businessService } from '@/src/services/entrepreneur';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE = 375;

const statusColor = (s: string) => {
  switch (s) {
    case 'approved':
      return { bg: '#E8F5E9', text: '#2E7D32' };

    case 'pending':
      return { bg: '#FFF8E1', text: '#F57F17' };

    case 'rejected':
      return { bg: '#FFEBEE', text: '#C62828' };

    case 'suspended':
      return { bg: '#F3F4F6', text: '#4B5563' };

    default:
      return { bg: '#EEF2FF', text: '#2D60FF' };
  }
};

export default function AdminBusinessDetailScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = (n: number) => Math.min((width / BASE) * n, n * 1.4);
  const { id } = useLocalSearchParams<{ id: string }>();


  // const handleAction = (status: string, reason?: string) => {
  //   Alert.alert(`${status} Business`, 'Are you sure?', [
  //     { text: 'Cancel', style: 'cancel' },
  //     {
  //       text: 'Confirm',
  //       onPress: () =>
  //         updateBusiness(
  //           { id, data: { status: status as any, rejectionReason: reason } },
  //           { onSuccess: () => { refetch(); Alert.alert('Done!', `Business ${status}.`); } }
  //         ),
  //     },
  //   ]);
  // };

  const [business, setBusiness] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isPending, setIsPending] = useState(false);

  const [isRefetching, setIsRefetching] =
    useState(false);
  const fetchBusiness = async (
    refresh = false
  ) => {
    try {
      refresh
        ? setIsRefetching(true)
        : setIsLoading(true);

      const res =
        await businessService.getDetail(id);

      if (res.success) {
        setBusiness(res.data);
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.userMessage ||
        error.response?.data?.message ||
        "Failed to load business."
      );
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };
  const updateBusiness = async (
    data: any
  ) => {
    try {
      setIsPending(true);

      const res =
        await businessService.adminUpdateStatus(
          id,
          data
        );

      if (res.success) {
        Alert.alert(
          "Success",
          res.message || "Business updated."
        );

        fetchBusiness(true);
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.userMessage ||
        error.response?.data?.message ||
        "Failed to update business."
      );
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBusiness();
    }
  }, [id]);
  const handleAction = (
    status:
      | "approved"
      | "rejected"
      | "suspended",
    reason?: string
  ) => {
    Alert.alert(
      `${status} Business`,
      "Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () =>
            updateBusiness({
              status,
              rejectionReason: reason,
            }),
        },
      ]
    );
  };

  if (isLoading) return (
    <View style={styles.container}>

      <View style={styles.centered}><ActivityIndicator size="large" color="#2D60FF" /></View>
    </View>
  );

  if (!business) return (
    <View style={styles.container}>

      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#E53935" />
        <Text style={styles.emptyText}>Business not found</Text>
      </View>
    </View>
  );

  const sc = statusColor(business.status);

  const InfoRow = ({ icon, label, value }: any) =>
    value ? (
      <View style={styles.infoRow}>
        <Ionicons name={icon} size={s(14)} color="#aaa" />
        <Text style={[styles.infoLabel, { fontSize: s(12) }]}>{label}:</Text>
        <Text style={[styles.infoValue, { fontSize: s(12) }]}>{value}</Text>
      </View>
    ) : null;

  return (
    <View style={styles.container}>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => fetchBusiness(true)}
            colors={['#2D60FF']}
          />


        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.heroCard, { borderRadius: s(16) }]}>
          <View style={styles.heroTop}>
            <View style={[styles.heroIcon, { width: s(60), height: s(60), borderRadius: s(16) }]}>
              <Ionicons name="storefront" size={s(28)} color="#2D60FF" />
            </View>
            <View style={{ flex: 1, marginLeft: s(14) }}>
              <Text style={[styles.bizName, { fontSize: s(17) }]}>{business.name}</Text>
              <View style={[styles.badge, { backgroundColor: sc.bg, alignSelf: 'flex-start', marginTop: 4 }]}>
                <Text style={[styles.badgeText, { color: sc.text, fontSize: s(11) }]}>
                  {business.status.charAt(0).toUpperCase() + business.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statVal, { fontSize: s(16) }]}>{business.totalViews}</Text>
              <Text style={[styles.statLabel, { fontSize: s(11) }]}>Views</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statVal, { fontSize: s(16) }]}>{business.totalContactClicks}</Text>
              <Text style={[styles.statLabel, { fontSize: s(11) }]}>Clicks</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statVal, { fontSize: s(16) }]}>{business.averageRating || 0}</Text>
              <Text style={[styles.statLabel, { fontSize: s(11) }]}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statVal, { fontSize: s(16) }]}>{business.totalRatings || 0}</Text>
              <Text style={[styles.statLabel, { fontSize: s(11) }]}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* Owner info */}
        <View style={[styles.section, { borderRadius: s(14) }]}>
          <Text style={[styles.sectionTitle, { fontSize: s(14) }]}>Owner</Text>
          <InfoRow icon="person-outline" label="Name" value={business.owner?.name} />
          <InfoRow icon="mail-outline" label="Email" value={business.owner?.email} />
          <InfoRow icon="phone-portrait-outline" label="Phone" value={business.owner?.mobileNumber} />
          <InfoRow icon="school-outline" label="Dept" value={business.owner?.departmentName} />
        </View>

        {/* Business info */}
        <View style={[styles.section, { borderRadius: s(14) }]}>
          <Text style={[styles.sectionTitle, { fontSize: s(14) }]}>Business Info</Text>
          <InfoRow icon="grid-outline" label="Category" value={business.category} />
          <InfoRow icon="location-outline" label="Location" value={[business.location?.area, business.location?.city].filter(Boolean).join(', ')} />
          <Text style={[styles.descText, { fontSize: s(13) }]}>{business.description}</Text>
        </View>

        {/* Contact */}
        <View style={[styles.section, { borderRadius: s(14) }]}>
          <Text style={[styles.sectionTitle, { fontSize: s(14) }]}>Contact</Text>
          <InfoRow icon="call-outline" label="Phone" value={business.contact?.phone} />
          <InfoRow icon="mail-outline" label="Email" value={business.contact?.email} />
          <InfoRow icon="logo-whatsapp" label="WhatsApp" value={business.contact?.whatsapp} />
          <InfoRow icon="location-outline" label="Address" value={business.contact?.address} />
        </View>

        {/* Rejection reason */}
        {business.rejectionReason && (
          <View style={[styles.rejectBox, { borderRadius: s(12) }]}>
            <Ionicons name="alert-circle-outline" size={s(16)} color="#C62828" />
            <Text style={[styles.rejectText, { fontSize: s(13) }]}>{business.rejectionReason}</Text>
          </View>
        )}

        {/* Admin actions */}
        <View style={[styles.actionsCard, { borderRadius: s(14) }]}>
          <Text style={[styles.sectionTitle, { fontSize: s(14) }]}>Admin Actions</Text>
          <View style={styles.actionsGrid}>
            {business.status === 'pending' && (
              <>
                <TouchableOpacity style={[styles.bigBtn, { backgroundColor: '#E8F5E9', borderRadius: s(12) }]}
                  onPress={() => handleAction('approved')}>
                  <Ionicons name="checkmark-circle" size={s(22)} color="#2E7D32" />
                  <Text style={[styles.bigBtnText, { color: '#2E7D32', fontSize: s(13) }]}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.bigBtn, { backgroundColor: '#FFEBEE', borderRadius: s(12) }]}
                  onPress={() => handleAction('rejected', 'Incomplete information.')}>
                  <Ionicons name="close-circle" size={s(22)} color="#C62828" />
                  <Text style={[styles.bigBtnText, { color: '#C62828', fontSize: s(13) }]}>Reject</Text>
                </TouchableOpacity>
              </>
            )}
            {business.status === 'approved' && (
              <>
                <TouchableOpacity style={[styles.bigBtn, { backgroundColor: '#EEF2FF', borderRadius: s(12) }]}
                  onPress={() =>
                    updateBusiness({
                      status: "approved",
                    })

                  }
                >
                  <Ionicons name="shield-checkmark" size={s(22)} color="#2D60FF" />
                  <Text style={[styles.bigBtnText, { color: '#2D60FF', fontSize: s(13) }]}>
                    {business.isVerified ? 'Remove Verify' : 'Verify'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.bigBtn, { backgroundColor: '#FFF3E0', borderRadius: s(12) }]}
                  onPress={() =>
                    updateBusiness({
                      status: "rejected",
                      rejectionReason: "Incomplete information.",
                    })

                  }>
                  <Ionicons name="star" size={s(22)} color="#E65100" />
                  <Text style={[styles.bigBtnText, { color: '#E65100', fontSize: s(13) }]}>
                    {business.isFeatured ? 'Unfeature' : 'Feature'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.bigBtn, { backgroundColor: '#F3F4F6', borderRadius: s(12) }]}
                  onPress={() => handleAction('suspended')}>
                  <Ionicons name="ban" size={s(22)} color="#4B5563" />
                  <Text style={[styles.bigBtnText, { color: '#4B5563', fontSize: s(13) }]}>Suspend</Text>
                </TouchableOpacity>
              </>
            )}
            {business.status === 'suspended' && (
              <TouchableOpacity style={[styles.bigBtn, { backgroundColor: '#E8F5E9', borderRadius: s(12) }]}
                onPress={() => handleAction('approved')}>
                <Ionicons name="refresh-circle" size={s(22)} color="#2E7D32" />
                <Text style={[styles.bigBtnText, { color: '#2E7D32', fontSize: s(13) }]}>Restore</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F5F7' },
  scroll: { padding: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  emptyText: { color: '#aaa', fontSize: 14 },
  heroCard: { backgroundColor: '#fff', padding: 16, marginBottom: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  heroIcon: { backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  bizName: { fontWeight: '800', color: '#1A1A2E', lineHeight: 24 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontWeight: '600' },
  statsRow: { flexDirection: 'row', backgroundColor: '#F8F9FF', borderRadius: 12, padding: 12 },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statVal: { fontWeight: '700', color: '#1A1A2E' },
  statLabel: { color: '#aaa' },
  statDivider: { width: 0.5, height: 36, backgroundColor: '#E5E7EB' },
  section: { backgroundColor: '#fff', padding: 16, marginBottom: 14, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4 },
  sectionTitle: { fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoLabel: { color: '#888', minWidth: 60 },
  infoValue: { color: '#333', flex: 1 },
  descText: { color: '#555', lineHeight: 20, marginTop: 8 },
  rejectBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FFEBEE', padding: 14, marginBottom: 14 },
  rejectText: { color: '#C62828', flex: 1, lineHeight: 20 },
  actionsCard: { backgroundColor: '#fff', padding: 16, marginBottom: 14, elevation: 1 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  bigBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  bigBtnText: { fontWeight: '700' },
});