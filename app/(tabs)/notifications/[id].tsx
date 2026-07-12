import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Notice, noticeService } from '../../../src/services/noticeService';

export default function NoticeDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Expo Router এর ফাইল নেমিং এর ওপর ভিত্তি করে আইডি এক্সট্র্যাক্ট করার সেফগার্ড লজিক
  // এটি `id` অথবা `view-id` ফরম্যাট থেকে মূল মোঙ্গোডিবি আইডিটি আলাদা করে নিবে।
  const rawId = (params.id || params.slug || '') as string;
  const id = rawId.includes('view-') ? rawId.split('view-')[1] : rawId;

  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
    
  useEffect(() => {
    // 🚫 যদি আইডি 'index', 'undefined' বা খালি হয়, তবে ব্যাকএন্ডে ফালতু রিকোয়েস্ট পাঠানো ব্লক করুন
    if (!id || id === 'index' || id === 'undefined') {
      console.warn("⚠️ Warning: Invalid ID intercepted, blocking API call.");
      return;
    }

    console.log("🚀 Cleaned Notice ID for API:", id);

    const fetchNoticeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await noticeService.getNoticeById(id);
        const data = response?.data || response; 
        
        if (data && (data._id || data.title)) {
          setNotice(data);
        } else {
          setError("নোটিশের তথ্য পাওয়া যায়নি।");
        }
      } catch (err: any) {
        setError(err.message || "ডিটেইলস লোড করতে ব্যর্থ হয়েছে।");
      } finally {
        setLoading(false);
      }
    };

    fetchNoticeDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !notice) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || "নোটিশটি খুঁজে পাওয়া যায়নি।"}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>ফিরে যান</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <Text style={[styles.badge, notice.type === 'Urgent' && styles.urgentBadge]}>
            {notice.type || 'General'}
          </Text>
        </View>

        <Text style={styles.title}>{notice.title}</Text>
        
        {notice.createdAt && (
          <Text style={styles.time}>
            প্রকাশিত হয়েছে: {new Date(notice.createdAt).toLocaleString('bn-BD')}
          </Text>
        )}
        
        <View style={styles.divider} />
        
        <Text style={styles.message}>{notice.message}</Text>
      </View>

      <TouchableOpacity style={styles.actionBtn} onPress={() => router.back()}>
        <Text style={styles.actionBtnText}>Back to Notifications</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc', justifyContent: 'center' },
  card: { backgroundColor: '#fff', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  badgeRow: { flexDirection: 'row', marginBottom: 12 },
  badge: { backgroundColor: '#eff6ff', color: '#2563eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, fontSize: 11, fontWeight: '700' },
  urgentBadge: { backgroundColor: '#fee2e2', color: '#ef4444' },
  title: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  time: { fontSize: 12, color: '#64748b', marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 16 },
  message: { fontSize: 14.5, color: '#334155', lineHeight: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: 20 },
  errorText: { color: '#ef4444', fontSize: 14, marginBottom: 16, textAlign: 'center' },
  backBtn: { backgroundColor: '#64748b', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  backBtnText: { color: '#fff', fontWeight: '600' },
  actionBtn: { marginTop: 20, backgroundColor: '#2563eb', padding: 15, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' }
});