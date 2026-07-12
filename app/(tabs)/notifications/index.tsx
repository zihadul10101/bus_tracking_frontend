import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Notice, noticeService } from '../../../src/services/noticeService';

// নোটিফিকেশন সেকশনের টাইপ ডেফিনিশন
interface NotificationSection {
  title: 'New' | 'Earlier';
  data: Notice[];
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [sections, setSections] = useState<NotificationSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // টাইমস্ট্যাম্প থেকে "১h" বা "১১h" ফরম্যাটে রূপান্তর এবং সেকশন ভাগ করার ফাংশন
  const processNoticeData = (notices: Notice[]) => {
    const now = new Date();
    const newNotices: Notice[] = [];
    const earlierNotices: Notice[] = [];

    notices.forEach((notice) => {
      const noticeDate = notice.createdAt ? new Date(notice.createdAt) : new Date();
      const diffInMs = now.getTime() - noticeDate.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

      // নোটিফিকেশনে দেখানোর জন্য কাস্টম টাইম প্রোপার্টি সাময়িকভাবে যুক্ত করা হচ্ছে
      const displayTime = diffInHours < 1
        ? `${Math.max(1, Math.floor(diffInMs / (1000 * 60)))}m`
        : `${diffInHours}h`;

      const formattedNotice = { ...notice, displayTime };

      // ২৪ ঘণ্টার কম হলে 'New', বেশি হলে 'Earlier'
      if (diffInHours < 24) {
        newNotices.push(formattedNotice);
      } else {
        earlierNotices.push(formattedNotice);
      }
    });

    const finalSections: NotificationSection[] = [];
    if (newNotices.length > 0) finalSections.push({ title: 'New', data: newNotices });
    if (earlierNotices.length > 0) finalSections.push({ title: 'Earlier', data: earlierNotices });

    setSections(finalSections);
  };

  const loadNotifications = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await noticeService.getAllNotices();
      const actualData = response?.notices || response?.data || response;

      if (Array.isArray(actualData)) {
        processNoticeData(actualData);
        // 🆕 Viewing this screen = read. Marks the "last seen" timestamp in
        // AsyncStorage so the drawer/bell badge count drops to 0. Not awaited
        // on purpose — this shouldn't block the list from rendering.
        noticeService.markAllAsRead(actualData);
      } else {
        setError("নোটিফিকেশনের সঠিক ডাটা ফরম্যাট পাওয়া যায়নি।");
      }
    } catch (err: any) {
      setError(err.message || "নেটওয়ার্ক ত্রুটি! আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>নোটিফিকেশন লোড হচ্ছে...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadNotifications()}>
          <Text style={styles.retryText}>আবার চেষ্টা করুন</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* 📜 নোটিফিকেশন সেকশন লিস্ট */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
        stickySectionHeadersEnabled={false}
        refreshing={refreshing}
        onRefresh={() => loadNotifications(true)}

        // সেকশন হেডার (New, Earlier)
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}

        // রিয়েল ডাটা কার্ড রেন্ডারিং
        renderItem={({ item }: { item: Notice & { displayTime?: string } }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
           onPress={() => router.push(`/(tabs)/notifications/${item._id}` as any)}
          >

            {/* প্রোফাইল আইকন বক্স এবং ব্লু ব্যাজ */}
            <View style={styles.avatarContainer}>
              <View style={styles.placeholderAvatar}>
                <Text style={styles.avatarText}>🎓</Text>
              </View>
              <View style={styles.blueBadge}>
                <Text style={styles.badgeText}>👥</Text>
              </View>
            </View>

            {/* ডাটা টেক্সট কন্টেন্ট */}
            <View style={styles.textContainer}>
              <Text style={styles.notificationText} numberOfLines={3}>
                <Text style={styles.boldText}>{item.title} </Text>
                {item.message}{' '}
                <Text style={styles.timeText}>{(item as any).displayTime || '1h'}</Text>
              </Text>
            </View>

            {/* থ্রি-ডট মেনু */}
            <TouchableOpacity style={styles.moreBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.moreIcon}>•••</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        // লিস্ট খালি থাকলে যা দেখাবে
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>কোনো নোটিফিকেশন পাওয়া যায়নি।</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// 🎨 ডিজাইন স্টাইলশিট (ইমেজের সাথে ১০০% মিল রেখে তৈরি)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  menuBtn: { marginRight: 16 },
  menuIcon: { fontSize: 24, color: '#0f172a' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  searchBtn: { padding: 4 },
  searchIcon: { fontSize: 20, color: '#0f172a' },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
  },
  card: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#e0f2fe', // ইমেজের মতো হালকা ব্লু আনরিড ব্যাকগ্রাউন্ড
    alignItems: 'center',
    marginBottom: 1,
  },
  avatarContainer: { position: 'relative', marginRight: 12 },
  placeholderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatarText: { fontSize: 22 },
  blueBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: '#3b82f6',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0f2fe',
  },
  badgeText: { fontSize: 10, color: '#ffffff' },
  textContainer: { flex: 1, paddingRight: 8 },
  notificationText: { fontSize: 14, color: '#334155', lineHeight: 20 },
  boldText: { fontWeight: '700', color: '#0f172a' },
  timeText: { color: '#64748b', fontSize: 13 },
  moreBtn: { paddingHorizontal: 4 },
  moreIcon: { fontSize: 14, color: '#334155', letterSpacing: -1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
  loadingText: { fontSize: 14, color: '#64748b', marginTop: 8 },
  errorText: { color: '#ef4444', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  retryBtn: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#2563eb', borderRadius: 6 },
  retryText: { color: '#fff', fontWeight: '600' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 14 }
});