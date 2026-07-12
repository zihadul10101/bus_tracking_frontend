import { adService, couponService, packageService } from '@/src/services/entrepreneur';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity,
  useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE = 375;
const API_BASE_URL = 'http://192.168.0.195:5000';

export default function RenewAdScreen() {
  const insets    = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = (n: number) => Math.min((width / BASE) * n, n * 1.4);
  const { id }    = useLocalSearchParams<{ id: string }>();

  const [packages, setPackages]   = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [renewing, setRenewing]   = useState(false);
  const [validating, setValidating] = useState(false);

  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [couponCode,  setCouponCode]  = useState('');
  const [couponData,  setCouponData]  = useState<any>(null);
  const [couponErr,   setCouponErr]   = useState('');
  const [form, setForm] = useState({ paymentMethod: 'bkash', transactionId: '' });

  // ✅ প্যাকেজ fetch করা
  // const fetchPackages = async () => {
  //   try {
  //     setIsLoading(true);
  //     const res = await fetch(`${API_BASE_URL}/api/v1/entrepreneur/packages`);
  //     const data = await res.json();
  //     if (data.success) setPackages(data.data || []);
  //   } catch (err) {
  //     console.error('fetchPackages error:', err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
const fetchPackages = async () => {
  try {
    setIsLoading(true);

    const data = await packageService.getAll();

    if (data.success) {
      setPackages(data.data || []);
    }
  } catch (err) {
    console.error('fetchPackages:', err);
  } finally {
    setIsLoading(false);
  }
};
  useEffect(() => {
    fetchPackages();
  }, []);

  const finalAmount = couponData ? couponData.finalAmount : selectedPkg?.price ?? 0;
  const isFree      = finalAmount === 0 || selectedPkg?.isFree;

  // ✅ কুপন ভ্যালিডেট
  // const handleValidateCoupon = async () => {
  //   if (!couponCode || !selectedPkg) return;
  //   setCouponErr('');
  //   setValidating(true);
  //   try {
  //     const token = await AsyncStorage.getItem('userToken');
  //     const res = await fetch(`${API_BASE_URL}/api/v1/entrepreneur/coupons/validate`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ code: couponCode, amount: selectedPkg.price }),
  //     });
  //     const data = await res.json();
  //     if (data.success) {
  //       setCouponData(data.data);
  //     } else {
  //       setCouponErr(data.message || 'Invalid coupon');
  //       setCouponData(null);
  //     }
  //   } catch (err: any) {
  //     setCouponErr(err.message || 'Invalid coupon');
  //     setCouponData(null);
  //   } finally {
  //     setValidating(false);
  //   }
  // };

const handleValidateCoupon = async () => {
  if (!couponCode || !selectedPkg) return;

  setCouponErr('');
  setValidating(true);

  try {
    const data = await couponService.validate(
      couponCode,
      selectedPkg.price
    );

    if (data.success) {
      setCouponData(data.data);
    } else {
      setCouponErr(data.message || 'Invalid coupon');
      setCouponData(null);
    }
  } catch (err: any) {
    setCouponErr(err?.response?.data?.message || 'Invalid coupon');
    setCouponData(null);
  } finally {
    setValidating(false);
  }
};

  // ✅ Renew submit করা
  // const handleRenew = async () => {
  //   if (!selectedPkg) { Alert.alert('Select a package first.'); return; }
  //   if (!isFree && !form.transactionId) { Alert.alert('Enter transaction ID.'); return; }

  //   setRenewing(true);
  //   try {
  //     const token = await AsyncStorage.getItem('token');
  //     const res = await fetch(`${API_BASE_URL}/api/v1/entrepreneur/ads/${id}/renew`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         packageId:     selectedPkg._id,
  //         couponCode:    couponCode || undefined,
  //         paymentMethod: isFree ? undefined : form.paymentMethod,
  //         transactionId: isFree ? undefined : form.transactionId,
  //       }),
  //     });
  //     const data = await res.json();
  //     if (data.success) {
  //       router.replace('/(tabs)/entrepreneur/student/ads/my-ads' as any);
  //     } else {
  //       Alert.alert('Error', data.message || 'Failed to renew ad.');
  //     }
  //   } catch (err: any) {
  //     Alert.alert('Error', err.message || 'Failed to renew ad.');
  //   } finally {
  //     setRenewing(false);
  //   }
  // };

const handleRenew = async () => {
  if (!selectedPkg) {
    Alert.alert('Select a package first.');
    return;
  }

  if (!isFree && !form.transactionId) {
    Alert.alert('Enter transaction ID.');
    return;
  }

  setRenewing(true);

  try {
    const data = await adService.renew(id!, {
      packageId: selectedPkg._id,
      couponCode: couponCode || undefined,
      paymentMethod: isFree ? undefined : form.paymentMethod,
      transactionId: isFree ? undefined : form.transactionId,
    });

    if (data.success) {
      router.replace('/(tabs)/entrepreneur/student/ads/my-ads' as any);
    } else {
      Alert.alert(
        'Error',
        data.message || 'Failed to renew ad.'
      );
    }
  } catch (err: any) {
    Alert.alert(
      'Error',
      err?.response?.data?.message || 'Failed to renew ad.'
    );
  } finally {
    setRenewing(false);
  }
};

  if (isLoading) return (
    <View style={styles.container}>
      <View style={styles.centered}><ActivityIndicator size="large" color="#2D60FF" /></View>
    </View>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.infoBanner, { borderRadius: s(12) }]}>
            <Ionicons name="refresh-circle" size={s(24)} color="#2D60FF" />
            <Text style={[styles.infoBannerText, { fontSize: s(13) }]}>
              Select a package to renew your ad listing.
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { fontSize: s(14), marginBottom: s(12) }]}>Select Package</Text>
          {packages.map((pkg: any) => (
            <TouchableOpacity key={pkg._id}
              style={[styles.pkgCard, { borderRadius: s(14), marginBottom: s(12) },
                selectedPkg?._id === pkg._id && styles.pkgCardActive]}
              onPress={() => { setSelectedPkg(pkg); setCouponData(null); setCouponCode(''); }}>
              <View style={styles.pkgTop}>
                <View>
                  <Text style={[styles.pkgName,     { fontSize: s(14) }]}>{pkg.name}</Text>
                  <Text style={[styles.pkgDuration, { fontSize: s(12) }]}>{pkg.durationDays} days</Text>
                </View>
                <Text style={[styles.pkgPrice, { fontSize: s(18) }]}>
                  {pkg.isFree ? 'FREE' : `৳${pkg.price}`}
                </Text>
              </View>
              {pkg.features?.length > 0 && (
                <View style={{ marginTop: 8, gap: 4 }}>
                  {pkg.features.map((f: string, i: number) => (
                    <View key={i} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={s(13)} color="#4CAF50" />
                      <Text style={[styles.featureText, { fontSize: s(12) }]}>{f}</Text>
                    </View>
                  ))}
                </View>
              )}
              {selectedPkg?._id === pkg._id && (
                <Ionicons name="checkmark-circle" size={s(20)} color="#2D60FF"
                  style={{ position: 'absolute', top: 12, right: 12 }} />
              )}
            </TouchableOpacity>
          ))}

          {selectedPkg && !selectedPkg.isFree && (
            <View style={{ marginBottom: s(16) }}>
              <Text style={[styles.label, { fontSize: s(13) }]}>Coupon (Optional)</Text>
              <View style={styles.couponRow}>
                <TextInput
                  style={[styles.input, { fontSize: s(13), borderRadius: s(10), flex: 1 }]}
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChangeText={(v) => { setCouponCode(v); setCouponData(null); setCouponErr(''); }}
                  autoCapitalize="characters"
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity style={styles.applyBtn} onPress={handleValidateCoupon} disabled={validating}>
                  {validating
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.applyText}>Apply</Text>
                  }
                </TouchableOpacity>
              </View>
              {couponErr ? (
                <Text style={styles.couponErr}>{couponErr}</Text>
              ) : couponData ? (
                <View style={styles.couponSuccess}>
                  <Ionicons name="checkmark-circle" size={14} color="#2E7D32" />
                  <Text style={styles.couponSuccessText}>
                    Discount ৳{couponData.discount} → Final ৳{couponData.finalAmount}
                    {couponData.isFree ? ' (FREE!)' : ''}
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          {selectedPkg && (
            <View style={[styles.summaryBox, { borderRadius: s(14) }]}>
              <Text style={[styles.sectionTitle, { fontSize: s(14), marginBottom: s(12) }]}>Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryKey, { fontSize: s(13) }]}>Package</Text>
                <Text style={[styles.summaryVal, { fontSize: s(13) }]}>{selectedPkg.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryKey, { fontSize: s(13) }]}>Duration</Text>
                <Text style={[styles.summaryVal, { fontSize: s(13) }]}>{selectedPkg.durationDays} days</Text>
              </View>
              {couponData && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryKey, { fontSize: s(13) }]}>Discount</Text>
                  <Text style={[styles.summaryVal, { fontSize: s(13), color: '#2E7D32' }]}>-৳{couponData.discount}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, { borderTopWidth: 0.5, borderTopColor: '#eee', marginTop: 8, paddingTop: 8 }]}>
                <Text style={[styles.summaryKey, { fontSize: s(15), fontWeight: '700' }]}>Total</Text>
                <Text style={[styles.summaryVal, { fontSize: s(16), fontWeight: '700', color: '#2D60FF' }]}>
                  {isFree ? 'FREE' : `৳${finalAmount}`}
                </Text>
              </View>
            </View>
          )}

          {selectedPkg && !isFree && (
            <View style={{ marginTop: s(16) }}>
              <Text style={[styles.label, { fontSize: s(13) }]}>Payment Method</Text>
              <View style={styles.methodRow}>
                {['bkash', 'nagad', 'rocket', 'card', 'cash'].map((m) => (
                  <TouchableOpacity key={m}
                    style={[styles.methodBtn, { borderRadius: s(10) },
                      form.paymentMethod === m && styles.methodBtnActive]}
                    onPress={() => setForm((p) => ({ ...p, paymentMethod: m }))}>
                    <Text style={[styles.methodText, { fontSize: s(12), color: form.paymentMethod === m ? '#fff' : '#555' }]}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ marginTop: s(12) }}>
                <Text style={[styles.label, { fontSize: s(13) }]}>Transaction ID *</Text>
                <TextInput
                  style={[styles.input, { fontSize: s(13), borderRadius: s(10) }]}
                  placeholder="Enter transaction ID"
                  value={form.transactionId}
                  onChangeText={(v) => setForm((p) => ({ ...p, transactionId: v }))}
                  placeholderTextColor="#aaa"
                />
                <Text style={[styles.payNote, { fontSize: s(12) }]}>
                  Send ৳{finalAmount} to our {form.paymentMethod} number and paste the transaction ID.
                </Text>
              </View>
            </View>
          )}

          {selectedPkg && isFree && (
            <View style={[styles.freeBox, { borderRadius: s(14) }]}>
              <Ionicons name="gift" size={32} color="#4CAF50" />
              <Text style={styles.freeText}>This renewal is FREE! Submit for admin approval.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={[styles.submitBtn, { borderRadius: s(12), opacity: !selectedPkg ? 0.5 : 1 }]}
          onPress={handleRenew}
          disabled={renewing || !selectedPkg}
        >
          {renewing
            ? <ActivityIndicator color="#fff" />
            : <>
                <Ionicons name="refresh" size={s(18)} color="#fff" />
                <Text style={[styles.submitText, { fontSize: s(15) }]}>Renew Ad</Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F3F5F7' },
  scroll:           { padding: 16 },
  centered:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionTitle:     { fontWeight: '700', color: '#1A1A2E' },
  label:            { fontWeight: '600', color: '#374151', marginBottom: 6 },
  input:            { backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 14, paddingVertical: 11, color: '#333' },
  infoBanner:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#EEF2FF', padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#C7D2FE' },
  infoBannerText:   { color: '#374151', flex: 1, lineHeight: 20 },
  pkgCard:          { backgroundColor: '#fff', padding: 16, borderWidth: 1.5, borderColor: 'transparent', position: 'relative' },
  pkgCardActive:    { borderColor: '#2D60FF', backgroundColor: '#EEF2FF' },
  pkgTop:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pkgName:          { fontWeight: '700', color: '#1A1A2E' },
  pkgDuration:      { color: '#888', marginTop: 2 },
  pkgPrice:         { fontWeight: '700', color: '#2D60FF' },
  featureRow:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  featureText:      { color: '#444' },
  couponRow:        { flexDirection: 'row', gap: 8, marginBottom: 8 },
  applyBtn:         { backgroundColor: '#2D60FF', paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minWidth: 70 },
  applyText:        { color: '#fff', fontWeight: '700', fontSize: 13 },
  couponErr:        { color: '#C62828', fontSize: 12 },
  couponSuccess:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E8F5E9', padding: 8, borderRadius: 8 },
  couponSuccessText:{ color: '#2E7D32', fontSize: 12, fontWeight: '600' },
  summaryBox:       { backgroundColor: '#fff', padding: 16 },
  summaryRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryKey:       { color: '#666' },
  summaryVal:       { fontWeight: '600', color: '#1A1A2E' },
  methodRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  methodBtn:        { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  methodBtnActive:  { backgroundColor: '#2D60FF', borderColor: '#2D60FF' },
  methodText:       { fontWeight: '600' },
  payNote:          { color: '#888', marginTop: 8, lineHeight: 18 },
  freeBox:          { alignItems: 'center', padding: 24, gap: 12, backgroundColor: '#E8F5E9', marginTop: 16, borderWidth: 1, borderColor: '#A7F3D0' },
  freeText:         { color: '#2E7D32', fontWeight: '600', textAlign: 'center', fontSize: 14 },
  bottomBar:        { padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#eee' },
  submitBtn:        { backgroundColor: '#2D60FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  submitText:       { color: '#fff', fontWeight: '700' },
});