import { adService, businessService, couponService, packageService } from '@/src/services/entrepreneur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity,
  useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const BASE = 375;

export default function SubmitAdScreen() {
  const insets    = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = (n: number) => Math.min((width / BASE) * n, n * 1.4);

  const [step,        setStep]        = useState(1);
  const [selectedBiz, setSelectedBiz] = useState<any>(null);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [couponCode,  setCouponCode]  = useState('');
  const [couponData,  setCouponData]  = useState<any>(null);
  const [couponErr,   setCouponErr]   = useState('');
  const [form, setForm] = useState({
    title: '', shortDescription: '',
    paymentMethod: 'bkash', transactionId: '',
  });

  const [allBusinesses, setAllBusinesses] = useState<any[]>([]);
  const [packages,      setPackages]      = useState<any[]>([]);
  const [bizLoading,    setBizLoading]    = useState(true);
  const [pkgLoading,    setPkgLoading]    = useState(true);
  const [validating,    setValidating]    = useState(false);
  const [submitting,    setSubmitting]    = useState(false);

  // ── API 1: নিজের বিজনেসগুলো fetch করা ────────────────────────────────────
  const fetchMyBusinesses = async () => {
    try {
      setBizLoading(true);
      const data = await businessService.getMyBusinesses();
      
      
      if (data.success) {
        setAllBusinesses(data.data || []);
      } else {
        Alert.alert('Error', data.message || 'Failed to load businesses.');
      }
    } catch (err: any) {
      console.error('fetchMyBusinesses error:', err);
      Alert.alert('Error', err.message || 'Failed to load businesses.');
    } finally {
      setBizLoading(false);
    }
  };

  // ── API 2: সব প্যাকেজ fetch করা (public route) ────────────────────────────
  const fetchPackages = async () => {
    try {
      setPkgLoading(true);
      const data = await packageService.getAll();
      if (data.success) {
        setPackages(data.data || []);
      } else {
        Alert.alert('Error', data.message || 'Failed to load packages.');
      }
    } catch (err: any) {
      console.error('fetchPackages error:', err);
      Alert.alert('Error', err.message || 'Failed to load packages.');
    } finally {
      setPkgLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBusinesses();
    fetchPackages();
  }, []);

  const businesses = allBusinesses.filter((b: any) => b.status === 'approved');

  const finalAmount = couponData ? couponData.finalAmount : selectedPkg?.price ?? 0;
  const isFree      = finalAmount === 0 || selectedPkg?.isFree;

  // ── API 3: কুপন ভ্যালিডেট করা ─────────────────────────────────────────────
  const handleValidateCoupon = async () => {
    if (!couponCode || !selectedPkg) return;
    setCouponErr('');
    setValidating(true);
    try {
      const data = await couponService.validate(couponCode, selectedPkg.price);
      if (data.success) {
        setCouponData(data.data);
      } else {
        setCouponErr(data.message || 'Invalid coupon');
        setCouponData(null);
      }
    } catch (err: any) {
      console.error('validateCoupon error:', err);
      setCouponErr(err.message || 'Invalid coupon');
      setCouponData(null);
    } finally {
      setValidating(false);
    }
  };

  // ── API 4: Ad সাবমিট করা ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedBiz || !selectedPkg || !form.title) {
      Alert.alert('Required', 'Please fill all required fields.');
      return;
    }
    if (!isFree && !form.transactionId) {
      Alert.alert('Required', 'Enter your transaction ID.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await adService.submit({
        businessId:       selectedBiz._id,
        title:            form.title,
        shortDescription: form.shortDescription,
        packageId:        selectedPkg._id,
        couponCode:       couponCode || undefined,
        paymentMethod:    isFree ? undefined : (form.paymentMethod as any),
        transactionId:    isFree ? undefined : form.transactionId,
      });
      if (data.success) {
        router.replace('/(tabs)/entrepreneur/student/ads/my-ads' as any);
      } else {
        Alert.alert('Error', data.message || 'Failed to submit ad.');
      }
    } catch (err: any) {
      console.error('submitAd error:', err);
      Alert.alert('Error', err.message || 'Failed to submit ad.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ['Business', 'Ad Info', 'Package', 'Payment'];
  const isLoading = bizLoading || pkgLoading;

  if (isLoading) return (
    <View style={styles.container}>
      <View style={styles.centered}><ActivityIndicator size="large" color="#2D60FF" /></View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Steps */}
      <View style={styles.stepRow}>
        {steps.map((label, i) => (
          <TouchableOpacity key={i} style={styles.stepItem} onPress={() => setStep(i + 1)}>
            <View style={[styles.stepDot, {
              backgroundColor: step === i + 1 ? '#2D60FF' : step > i + 1 ? '#4CAF50' : '#E5E7EB',
            }]}>
              {step > i + 1
                ? <Ionicons name="checkmark" size={12} color="#fff" />
                : <Text style={styles.stepNum}>{i + 1}</Text>
              }
            </View>
            <Text style={[styles.stepLabel, { fontSize: s(10), color: step === i + 1 ? '#2D60FF' : '#aaa' }]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* STEP 1 — Select Business */}
          {step === 1 && (
            <View>
              <Text style={[styles.sectionTitle, { fontSize: s(14), marginBottom: s(12) }]}>
                Select Your Business
              </Text>
              {businesses.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="storefront-outline" size={40} color="#ddd" />
                  <Text style={styles.emptyText}>No approved businesses found.</Text>
                  <TouchableOpacity style={[styles.createBtn, { borderRadius: s(10) }]}
                    onPress={() => router.push('/(tabs)/entrepreneur/student/businesses/create' as any)}>
                    <Text style={styles.createBtnText}>Create Business First</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                businesses.map((biz: any) => (
                  <TouchableOpacity key={biz._id}
                    style={[styles.selectCard, { borderRadius: s(12), marginBottom: s(10) },
                      selectedBiz?._id === biz._id && styles.selectCardActive]}
                    onPress={() => setSelectedBiz(biz)}>
                    <View style={[styles.bizIconBox, { width: s(40), height: s(40), borderRadius: s(10) }]}>
                      <Ionicons name="storefront" size={s(20)} color="#2D60FF" />
                    </View>
                    <View style={{ flex: 1, marginLeft: s(12) }}>
                      <Text style={[styles.selectCardTitle, { fontSize: s(13) }]}>{biz.name}</Text>
                      <Text style={[styles.selectCardSub,   { fontSize: s(12) }]}>{biz.category}</Text>
                    </View>
                    {selectedBiz?._id === biz._id && (
                      <Ionicons name="checkmark-circle" size={s(20)} color="#2D60FF" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* STEP 2 — Ad Info */}
          {step === 2 && (
            <View>
              <Text style={[styles.label, { fontSize: s(13) }]}>Ad Title *</Text>
              <TextInput
                style={[styles.input, { fontSize: s(13), borderRadius: s(10), marginBottom: s(14) }]}
                placeholder="e.g. Grand Opening Sale — 50% Off!"
                value={form.title}
                onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
                placeholderTextColor="#aaa"
              />
              <Text style={[styles.label, { fontSize: s(13) }]}>Short Description</Text>
              <TextInput
                style={[styles.input, { fontSize: s(13), borderRadius: s(10), height: s(80), textAlignVertical: 'top', paddingTop: s(10) }]}
                placeholder="Brief description of your ad..."
                value={form.shortDescription}
                onChangeText={(v) => setForm((p) => ({ ...p, shortDescription: v }))}
                multiline
                placeholderTextColor="#aaa"
              />
            </View>
          )}

          {/* STEP 3 — Package */}
          {step === 3 && (
            <View>
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

              {/* Coupon */}
              {selectedPkg && !selectedPkg.isFree && (
                <View style={{ marginTop: s(8) }}>
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
            </View>
          )}

          {/* STEP 4 — Payment */}
          {step === 4 && selectedPkg && (
            <View>
              <View style={[styles.summaryBox, { borderRadius: s(14) }]}>
                <Text style={[styles.sectionTitle, { fontSize: s(14), marginBottom: s(12) }]}>Order Summary</Text>
                {[
                  { key: 'Business', val: selectedBiz?.name },
                  { key: 'Package',  val: selectedPkg?.name },
                  { key: 'Duration', val: `${selectedPkg?.durationDays} days` },
                ].map((row) => (
                  <View key={row.key} style={styles.summaryRow}>
                    <Text style={[styles.summaryKey, { fontSize: s(13) }]}>{row.key}</Text>
                    <Text style={[styles.summaryVal, { fontSize: s(13) }]}>{row.val}</Text>
                  </View>
                ))}
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

              {!isFree && (
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
                  <View style={{ marginTop: s(14) }}>
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

              {isFree && (
                <View style={[styles.freeBox, { borderRadius: s(14) }]}>
                  <Ionicons name="gift" size={32} color="#4CAF50" />
                  <Text style={styles.freeText}>This ad is FREE! Submit for admin approval.</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        {step > 1 && (
          <TouchableOpacity style={[styles.navBtn, { backgroundColor: '#F3F4F6', flex: 1 }]}
            onPress={() => setStep((p) => p - 1)}>
            <Ionicons name="arrow-back" size={16} color="#555" />
            <Text style={[styles.navBtnText, { color: '#555' }]}>Back</Text>
          </TouchableOpacity>
        )}
        {step < 4 ? (
          <TouchableOpacity style={[styles.navBtn, { backgroundColor: '#2D60FF', flex: 2 }]}
            onPress={() => setStep((p) => p + 1)}>
            <Text style={[styles.navBtnText, { color: '#fff' }]}>Next</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.navBtn, { backgroundColor: '#2D60FF', flex: 2 }]}
            onPress={handleSubmit} disabled={submitting}>
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="send" size={16} color="#fff" />
                  <Text style={[styles.navBtnText, { color: '#fff' }]}>Submit Ad</Text>
                </>
            }
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F3F5F7' },
  scroll:           { padding: 16 },
  centered:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label:            { fontWeight: '600', color: '#374151', marginBottom: 6 },
  sectionTitle:     { fontWeight: '700', color: '#1A1A2E' },
  input:            { backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 14, paddingVertical: 11, color: '#333' },
  emptyBox:         { alignItems: 'center', padding: 32, gap: 12 },
  emptyText:        { color: '#aaa', fontSize: 14 },
  createBtn:        { backgroundColor: '#2D60FF', paddingHorizontal: 20, paddingVertical: 10 },
  createBtnText:    { color: '#fff', fontWeight: '700' },
  selectCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderWidth: 1.5, borderColor: 'transparent' },
  selectCardActive: { borderColor: '#2D60FF', backgroundColor: '#EEF2FF' },
  bizIconBox:       { backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  selectCardTitle:  { fontWeight: '700', color: '#1A1A2E' },
  selectCardSub:    { color: '#888', marginTop: 2, textTransform: 'capitalize' },
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
  methodRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  methodBtn:        { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  methodBtnActive:  { backgroundColor: '#2D60FF', borderColor: '#2D60FF' },
  methodText:       { fontWeight: '600' },
  payNote:          { color: '#888', marginTop: 8, lineHeight: 18 },
  freeBox:          { alignItems: 'center', padding: 24, gap: 12, backgroundColor: '#E8F5E9', marginTop: 16, borderWidth: 1, borderColor: '#A7F3D0' },
  freeText:         { color: '#2E7D32', fontWeight: '600', textAlign: 'center', fontSize: 14 },
  stepRow:          { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  stepItem:         { alignItems: 'center', gap: 4 },
  stepDot:          { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepNum:          { color: '#fff', fontSize: 11, fontWeight: '700' },
  stepLabel:        { fontWeight: '600' },
  bottomBar:        { flexDirection: 'row', gap: 10, padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#eee' },
  navBtn:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12 },
  navBtnText:       { fontWeight: '700', fontSize: 14 },
});