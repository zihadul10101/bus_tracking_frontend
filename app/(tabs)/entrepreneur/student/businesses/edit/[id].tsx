
import { businessService } from '@/src/services/entrepreneur';
import { BUSINESS_CATEGORIES } from '@/src/services/entrepreneur/businessCategories';
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

export default function EditBusinessScreen() {
  const insets    = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = (n: number) => Math.min((width / BASE) * n, n * 1.4);
  const { id }    = useLocalSearchParams<{ id: string }>();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: '', category: '', description: '',
    phone: '', email: '', whatsapp: '', address: '',
    facebook: '', instagram: '', twitter: '', website: '', youtube: '',
    city: '', area: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);

  // ── Fetch business detail on mount ──────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const fetchBusiness = async () => {
      try {
        setIsLoading(true);
        const res = await businessService.getById(id);
        if (res.success) {
          const business = res.data;
          setForm({
            name:        business.name        || '',
            category:    business.category    || '',
            description: business.description || '',
            phone:    business.contact?.phone    || '',
            email:    business.contact?.email    || '',
            whatsapp: business.contact?.whatsapp || '',
            address:  business.contact?.address  || '',
            facebook:  business.socialLinks?.facebook  || '',
            instagram: business.socialLinks?.instagram || '',
            twitter:   business.socialLinks?.twitter   || '',
            website:   business.socialLinks?.website   || '',
            youtube:   business.socialLinks?.youtube   || '',
            city: business.location?.city || '',
            area: business.location?.area || '',
          });
        } else {
          Alert.alert('Error', res.message || 'Failed to load business.');
        }
      } catch (error: any) {
        console.log('Fetch Business Error:', error.response?.data || error.message);
        Alert.alert('Error', error.response?.data?.message || 'Failed to load business.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusiness();
  }, [id]);

  const update = (key: string, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!form.name || !form.category || !form.description) {
      Alert.alert('Required', 'Name, category and description are required.');
      return;
    }

    try {
      setIsSaving(true);
      const res = await businessService.update(id, {
        name: form.name, category: form.category, description: form.description,
        contact:     { phone: form.phone || undefined, email: form.email || undefined, whatsapp: form.whatsapp || undefined, address: form.address || undefined },
        socialLinks: { facebook: form.facebook || undefined, instagram: form.instagram || undefined, twitter: form.twitter || undefined, website: form.website || undefined, youtube: form.youtube || undefined },
        location:    { city: form.city || undefined, area: form.area || undefined },
      });

      if (res.success) {
        router.back();
      } else {
        Alert.alert('Error', res.message || 'Failed to update business.');
      }
    } catch (error: any) {
      console.log('Update Business Error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update business.');
    } finally {
      setIsSaving(false);
    }
  };

  const Field = ({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }: any) => (
    <View style={{ marginBottom: s(14) }}>
      <Text style={[styles.label, { fontSize: s(13) }]}>{label}</Text>
      <TextInput
        style={[styles.input, { fontSize: s(13), borderRadius: s(10) },
          multiline && { height: s(80), textAlignVertical: 'top', paddingTop: s(10) }]}
        placeholder={placeholder} value={value} onChangeText={onChangeText}
        multiline={multiline} keyboardType={keyboardType} placeholderTextColor="#aaa"
      />
    </View>
  );

  const steps = ['Basic', 'Contact', 'Social', 'Location'];

  if (isLoading) return (
    <View style={styles.container}>
      <View style={styles.centered}><ActivityIndicator size="large" color="#2D60FF" /></View>
    </View>
  );

  return (
    <View style={styles.container}>
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
          {step === 1 && (
            <View>
              <Field label="Business Name *" value={form.name} onChangeText={(v: string) => update('name', v)} placeholder="Business name" />
              <Text style={[styles.label, { fontSize: s(13), marginBottom: s(8) }]}>Category *</Text>
              <View style={styles.catGrid}>
                {BUSINESS_CATEGORIES.map((cat) => (
                  <TouchableOpacity key={cat}
                    style={[styles.catOption, { borderRadius: s(10) }, form.category === cat && styles.catOptionActive]}
                    onPress={() => update('category', cat)}>
                    <Text style={[styles.catOptionText, { fontSize: s(12), color: form.category === cat ? '#fff' : '#555' }]}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Field label="Description *" value={form.description} onChangeText={(v: string) => update('description', v)} placeholder="Describe your business..." multiline />
            </View>
          )}
          {step === 2 && (
            <View>
              <Field label="Phone"    value={form.phone}    onChangeText={(v: string) => update('phone', v)}    placeholder="01XXXXXXXXX" keyboardType="phone-pad" />
              <Field label="Email"    value={form.email}    onChangeText={(v: string) => update('email', v)}    placeholder="business@email.com" keyboardType="email-address" />
              <Field label="WhatsApp" value={form.whatsapp} onChangeText={(v: string) => update('whatsapp', v)} placeholder="01XXXXXXXXX" keyboardType="phone-pad" />
              <Field label="Address"  value={form.address}  onChangeText={(v: string) => update('address', v)}  placeholder="Full address" />
            </View>
          )}
          {step === 3 && (
            <View>
              <Field label="Facebook"  value={form.facebook}  onChangeText={(v: string) => update('facebook', v)}  placeholder="https://facebook.com/..." />
              <Field label="Instagram" value={form.instagram} onChangeText={(v: string) => update('instagram', v)} placeholder="https://instagram.com/..." />
              <Field label="Twitter"   value={form.twitter}   onChangeText={(v: string) => update('twitter', v)}   placeholder="https://twitter.com/..." />
              <Field label="Website"   value={form.website}   onChangeText={(v: string) => update('website', v)}   placeholder="https://yourwebsite.com" />
              <Field label="YouTube"   value={form.youtube}   onChangeText={(v: string) => update('youtube', v)}   placeholder="https://youtube.com/..." />
            </View>
          )}
          {step === 4 && (
            <View>
              <Field label="City" value={form.city} onChangeText={(v: string) => update('city', v)} placeholder="e.g. Dhaka" />
              <Field label="Area" value={form.area} onChangeText={(v: string) => update('area', v)} placeholder="e.g. Mirpur" />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

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
            onPress={handleSave} disabled={isSaving}>
            {isSaving
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="save-outline" size={16} color="#fff" />
                  <Text style={[styles.navBtnText, { color: '#fff' }]}>Save Changes</Text>
                </>
            }
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F3F5F7' },
  scroll:          { padding: 16 },
  centered:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label:           { fontWeight: '600', color: '#374151', marginBottom: 6 },
  input:           { backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 14, paddingVertical: 11, color: '#333' },
  catGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catOption:       { borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#fff' },
  catOptionActive: { backgroundColor: '#2D60FF', borderColor: '#2D60FF' },
  catOptionText:   { fontWeight: '600' },
  stepRow:         { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  stepItem:        { alignItems: 'center', gap: 4 },
  stepDot:         { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepNum:         { color: '#fff', fontSize: 11, fontWeight: '700' },
  stepLabel:       { fontWeight: '600' },
  bottomBar:       { flexDirection: 'row', gap: 10, padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#eee' },
  navBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12 },
  navBtnText:      { fontWeight: '700', fontSize: 14 },
});