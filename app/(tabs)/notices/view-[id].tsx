import { noticeService } from '@/src/services/noticeService';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, FileText, Megaphone, Save, Tag } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditNotice() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [form, setForm] = useState({ title: '', message: '', type: 'General' });
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const noticeTypes = ['General', 'Student', 'Driver', 'Urgent'];

  useEffect(() => {
    if (id) {
      noticeService.getNoticeById(id)
        .then((res) => {
          if (res && res.success && res.data) {
            setForm({
              title: res.data.title || '',
              message: res.data.message || '',
              type: res.data.type || 'General',
            });
          } else {
            Alert.alert("Error", "Failed to fetch notice data.");
          }
        })
        .catch((err: any) => Alert.alert("Error", err.userMessage || err.message || "Something went wrong fetching notice details."))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      Alert.alert("Validation Error", "Title and message are required!");
      return;
    }

    try {
      setSubmitting(true);
      const response = await noticeService.updateNotice(id, {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
      });

      if (response.success) {
        Alert.alert("Success", "Notice updated successfully!");
        router.back();
      } else {
        Alert.alert("Failed", response.message || "Could not update notice");
      }
    } catch (error: any) {
      // ✅ api.ts এর response interceptor থেকে আসা user-friendly মেসেজ প্রাধান্য পাবে
      Alert.alert("Error", error.userMessage || error.message || "Failed to update notice.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Fetching notice data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Notice</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Notice Title</Text>
        <View style={styles.inputContainer}>
          <Megaphone size={18} color="#64748b" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Notice Title"
            placeholderTextColor="#94a3b8"
            value={form.title}
            onChangeText={(val) => handleChange('title', val)}
          />
        </View>

        <Text style={styles.label}>Notice Target Audience / Type</Text>
        <View style={styles.typeSelectorRow}>
          {noticeTypes.map((t) => {
            const isSelected = form.type === t;
            return (
              <TouchableOpacity
                key={t}
                activeOpacity={0.7}
                style={[styles.typeBadge, isSelected && styles.typeBadgeActive]}
                onPress={() => handleChange('type', t)}
              >
                <Tag size={12} color={isSelected ? '#fff' : '#64748b'} />
                <Text style={[styles.typeBadgeText, isSelected && styles.typeBadgeTextActive]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Notice Message</Text>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <FileText size={18} color="#64748b" style={[styles.icon, { marginTop: 14 }]} />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write details..."
            placeholderTextColor="#94a3b8"
            multiline={true}
            numberOfLines={6}
            textAlignVertical="top"
            value={form.message}
            onChangeText={(val) => handleChange('message', val)}
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.disabledButton]} 
          onPress={handleUpdate}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : (
            <>
              <Save size={18} color="#fff" />
              <Text style={styles.submitButtonText}>Update Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: 20 },
  loadingText: { marginTop: 8, fontSize: 13, color: '#64748b' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backButton: { padding: 6, borderRadius: 8, backgroundColor: '#f1f5f9', marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  formContainer: { padding: 20, gap: 14 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: -4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12 },
  textAreaContainer: { alignItems: 'flex-start' },
  icon: { marginRight: 8 },
  input: { flex: 1, height: 48, color: '#1e293b', fontSize: 15 },
  textArea: { height: 120, paddingTop: 12, paddingBottom: 12 },
  typeSelectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 4 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1' },
  typeBadgeActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  typeBadgeText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  typeBadgeTextActive: { color: '#fff' },
  submitButton: { flexDirection: 'row', backgroundColor: '#2563eb', height: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1 },
  disabledButton: { backgroundColor: '#94a3b8' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});