import { adService } from '@/src/services/entrepreneur';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  RefreshControl, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity,
  useWindowDimensions, View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE = 375;
const API_BASE_URL = 'http://192.168.0.195:5000';

const statusColor = (s: string) => {
  switch (s) {
    case 'approved': return { bg: '#E8F5E9', text: '#2E7D32' };
    case 'pending':  return { bg: '#FFF8E1', text: '#F57F17' };
    case 'rejected': return { bg: '#FFEBEE', text: '#C62828' };
    case 'hidden':   return { bg: '#F3F4F6', text: '#4B5563' };
    case 'expired':  return { bg: '#EDE9FE', text: '#6D28D9' };
    default:         return { bg: '#EEF2FF', text: '#2D60FF' };
  }
};

export default function AdminAdDetailScreen() {
  const insets    = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = (n: number) => Math.min((width / BASE) * n, n * 1.4);
  const { id }    = useLocalSearchParams<{ id: string }>();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const [ad, setAd] = useState<any>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isPending, setIsPending]       = useState(false);
  const { status: initStatus } = useLocalSearchParams<{ status?: string }>();

const [filter, setFilter] = useState(initStatus || "all");

console.log("addd",ad);


const fetchAds = async (isRefresh = false) => {
  try {
    isRefresh ? setIsRefetching(true) : setIsLoading(true);

    const res = await adService.adminGetAll(
      filter === "all"
        ? undefined
        : {
            status: filter,
          }
    );

    setAd(res.data || []);
  } catch (error: any) {
    Alert.alert("Error", error.userMessage);
  } finally {
    setIsLoading(false);
    setIsRefetching(false);
  }
};


  // ✅ Ad ডিটেইল fetch করা
const fetchAdDetail = async (isRefresh = false) => {
  try {
    isRefresh
      ? setIsRefetching(true)
      : setIsLoading(true);

    const res = await adService.getById(id);

    setAd(res.data);
  } catch (error: any) {
    Alert.alert("Error", error.userMessage);
  } finally {
    setIsLoading(false);
    setIsRefetching(false);
  }
};

  useEffect(() => {
    fetchAdDetail();
  }, [id]);

  // ✅ Ad status আপডেট করা (approve/reject/feature/hide/unhide)
const updateAd = async (
  payload: any,
  callback?: () => void
) => {
  try {
    setIsPending(true);

    await adService.adminUpdateStatus(id, payload);

    fetchAdDetail(true);

    callback?.();

    Alert.alert(
      "Success",
      "Advertisement updated successfully."
    );
  } catch (error: any) {
    Alert.alert("Error", error.userMessage);
  } finally {
    setIsPending(false);
  }
};

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  if (isLoading) return (
    <View style={styles.container}>
      <View style={styles.centered}><ActivityIndicator size="large" color="#2D60FF" /></View>
    </View>
  );

  if (!ad) return (
    <View style={styles.container}>
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#E53935" />
        <Text style={styles.emptyText}>Ad not found</Text>
      </View>
    </View>
  );

  const sc = statusColor(ad.status);

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
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => fetchAdDetail(true)} colors={['#2D60FF']} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { borderRadius: s(16) }]}>
          <View style={styles.heroTop}>
            <View style={[styles.heroIcon, { width: s(56), height: s(56), borderRadius: s(14) }]}>
              <Ionicons name="megaphone" size={s(26)} color="#2D60FF" />
            </View>
            <View style={{ flex: 1, marginLeft: s(14) }}>
              <Text style={[styles.adTitle, { fontSize: s(16) }]}>{ad.title}</Text>
              <View style={[styles.badge, { backgroundColor: sc.bg, alignSelf: 'flex-start', marginTop: 4 }]}>
                <Text style={[styles.badgeText, { color: sc.text, fontSize: s(11) }]}>
                  {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
          {ad.shortDescription && (
            <Text style={[styles.adDesc, { fontSize: s(13) }]}>{ad.shortDescription}</Text>
          )}
          <View style={styles.statsRow}>
            {[
              { icon: 'eye-outline',          val: ad.views,          label: 'Views'    },
              { icon: 'call-outline',          val: ad.callClicks,     label: 'Calls'    },
              { icon: 'logo-whatsapp',         val: ad.whatsappClicks, label: 'WhatsApp' },
              { icon: 'share-social-outline',  val: ad.shareCount,     label: 'Shares'   },
            ].map((stat) => (
              <View key={stat.label} style={styles.stat}>
                <Ionicons name={stat.icon as any} size={s(14)} color="#2D60FF" />
                <Text style={[styles.statVal, { fontSize: s(13) }]}>{stat.val}</Text>
                <Text style={[styles.statLabel, { fontSize: s(10) }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, { borderRadius: s(14) }]}>
          <Text style={[styles.sectionTitle, { fontSize: s(14) }]}>Business</Text>
          <InfoRow icon="storefront-outline"   label="Name"    value={ad.business?.name} />
          <InfoRow icon="grid-outline"         label="Category" value={ad.business?.category} />
          <InfoRow icon="person-outline"       label="Owner"   value={ad.owner?.name} />
          <InfoRow icon="mail-outline"         label="Email"   value={ad.owner?.email} />
        </View>

        <View style={[styles.section, { borderRadius: s(14) }]}>
          <Text style={[styles.sectionTitle, { fontSize: s(14) }]}>Package & Payment</Text>
          <InfoRow icon="cube-outline"     label="Package"  value={ad.package?.name} />
          <InfoRow icon="time-outline"     label="Duration" value={`${ad.durationDays} days`} />
          <InfoRow icon="calendar-outline" label="Start"    value={formatDate(ad.startDate)} />
          <InfoRow icon="calendar-outline" label="End"      value={formatDate(ad.endDate)} />
          <InfoRow icon="card-outline"     label="Amount"  value={ad.package?.isFree ? "FREE" : `৳${ad.package?.price}`} />
          <InfoRow icon="checkmark-circle-outline" label="Payment" value={ad.payment?.status} />
          {ad.payment?.transactionId && (
            <InfoRow icon="receipt-outline" label="TxnID" value={ad.payment.transactionId} />
          )}
        </View>

        {ad.rejectionReason && (
          <View style={[styles.rejectBox, { borderRadius: s(12) }]}>
            <Ionicons name="alert-circle-outline" size={s(16)} color="#C62828" />
            <Text style={[styles.rejectText, { fontSize: s(13) }]}>{ad.rejectionReason}</Text>
          </View>
        )}

        <View style={[styles.actionsCard, { borderRadius: s(14) }]}>
          <Text style={[styles.sectionTitle, { fontSize: s(14) }]}>Admin Actions</Text>

          {showRejectInput && (
            <View style={{ marginBottom: 12 }}>
              <TextInput
                style={[styles.rejectInput, { fontSize: s(13), borderRadius: s(10) }]}
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChangeText={setRejectReason}
                placeholderTextColor="#aaa"
                multiline
              />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TouchableOpacity style={[styles.rejectConfirmBtn, { borderRadius: s(8), backgroundColor: '#FFEBEE', flex: 1 }]}
                  onPress={() => {
                    if (!rejectReason.trim()) { Alert.alert('Enter reason.'); return; }
                    updateAd({ status: 'rejected', rejectionReason: rejectReason }, () => {
                      setShowRejectInput(false);
                      setRejectReason('');
                    });
                  }}>
                  <Text style={[styles.rejectConfirmText, { color: '#C62828', fontSize: s(13) }]}>Confirm Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.rejectConfirmBtn, { borderRadius: s(8), backgroundColor: '#F3F4F6', flex: 1 }]}
                  onPress={() => setShowRejectInput(false)}>
                  <Text style={[styles.rejectConfirmText, { color: '#555', fontSize: s(13) }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.actionsGrid}>
            {ad.status === 'pending' && (
              <>
                <TouchableOpacity style={[styles.bigBtn, { backgroundColor: '#E8F5E9', borderRadius: s(12) }]}
                  disabled={isPending}
                  onPress={() => updateAd({ status: 'approved' })}>
                  <Ionicons name="checkmark-circle" size={s(20)} color="#2E7D32" />
                  <Text style={[styles.bigBtnText, { color: '#2E7D32', fontSize: s(13) }]}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.bigBtn, { backgroundColor: '#FFEBEE', borderRadius: s(12) }]}
                  onPress={() => setShowRejectInput(true)}>
                  <Ionicons name="close-circle" size={s(20)} color="#C62828" />
                  <Text style={[styles.bigBtnText, { color: '#C62828', fontSize: s(13) }]}>Reject</Text>
                </TouchableOpacity>
              </>
            )}
            {ad.status === 'approved' && (
              <>
                <TouchableOpacity style={[styles.bigBtn, { backgroundColor: '#FFF3E0', borderRadius: s(12) }]}
                  onPress={() => updateAd({ isFeatured: !ad.isFeatured })}>
                  <Ionicons name="star" size={s(20)} color="#E65100" />
                  <Text style={[styles.bigBtnText, { color: '#E65100', fontSize: s(13) }]}>{ad.isFeatured ? 'Unfeature' : 'Feature'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.bigBtn, { backgroundColor: '#F3F4F6', borderRadius: s(12) }]}
                  onPress={() => updateAd({ status: 'hidden' })}>
                  <Ionicons name="eye-off" size={s(20)} color="#4B5563" />
                  <Text style={[styles.bigBtnText, { color: '#4B5563', fontSize: s(13) }]}>Hide</Text>
                </TouchableOpacity>
              </>
            )}
            {ad.status === 'hidden' && (
              <TouchableOpacity style={[styles.bigBtn, { backgroundColor: '#E8F5E9', borderRadius: s(12) }]}
                onPress={() => updateAd({ status: 'approved' })}>
                <Ionicons name="eye" size={s(20)} color="#2E7D32" />
                <Text style={[styles.bigBtnText, { color: '#2E7D32', fontSize: s(13) }]}>Unhide</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#F3F5F7' },
  scroll:            { padding: 16 },
  centered:          { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  emptyText:         { color: '#aaa', fontSize: 14 },
  heroCard:          { backgroundColor: '#fff', padding: 16, marginBottom: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
  heroTop:           { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  heroIcon:          { backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  adTitle:           { fontWeight: '800', color: '#1A1A2E', lineHeight: 24 },
  adDesc:            { color: '#666', lineHeight: 20, marginBottom: 12 },
  badge:             { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:         { fontWeight: '600' },
  statsRow:          { flexDirection: 'row', backgroundColor: '#F8F9FF', borderRadius: 12, padding: 10 },
  stat:              { flex: 1, alignItems: 'center', gap: 2 },
  statVal:           { fontWeight: '700', color: '#1A1A2E' },
  statLabel:         { color: '#aaa' },
  section:           { backgroundColor: '#fff', padding: 16, marginBottom: 14, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4 },
  sectionTitle:      { fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  infoRow:           { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoLabel:         { color: '#888', minWidth: 70 },
  infoValue:         { color: '#333', flex: 1 },
  rejectBox:         { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FFEBEE', padding: 14, marginBottom: 14 },
  rejectText:        { color: '#C62828', flex: 1, lineHeight: 20 },
  actionsCard:       { backgroundColor: '#fff', padding: 16, marginBottom: 14, elevation: 1 },
  rejectInput:       { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 10, color: '#333', minHeight: 60, textAlignVertical: 'top' },
  rejectConfirmBtn:  { paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  rejectConfirmText: { fontWeight: '700' },
  actionsGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bigBtn:            { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  bigBtnText:        { fontWeight: '700' },
});