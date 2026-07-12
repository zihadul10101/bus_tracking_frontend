import { paymentService } from '@/src/services/entrepreneur';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Platform,
  RefreshControl, ScrollView, StyleSheet, Text,
  TouchableOpacity, useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE     = 375;
const API_BASE_URL = 'http://192.168.0.195:5000';
const STATUSES = ['all', 'pending', 'verified', 'rejected', 'refunded'];

const statusColor = (s: string) => {
  switch (s) {
    case 'verified': return { bg: '#E8F5E9', text: '#2E7D32' };
    case 'pending':  return { bg: '#FFF8E1', text: '#F57F17' };
    case 'rejected': return { bg: '#FFEBEE', text: '#C62828' };
    case 'refunded': return { bg: '#EDE9FE', text: '#6D28D9' };
    default:         return { bg: '#F3F4F6', text: '#4B5563' };
  }
};

export default function AdminPaymentsScreen() {
  const insets    = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = (n: number) => Math.min((width / BASE) * n, n * 1.4);
  const [filter, setFilter] = useState('all');

  const [payments, setPayments] = useState<any[]>([]);
  const [revenue,  setRevenue]  = useState<any>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isPending, setIsPending]       = useState(false);

  console.log("revinew",revenue);
  

  // ✅ পেমেন্ট লিস্ট fetch করা (status filter সহ)
const fetchPayments = async (isRefresh = false) => {
  try {
    isRefresh ? setIsRefetching(true) : setIsLoading(true);

    const res = await paymentService.adminGetAll(
      filter === "all"
        ? undefined
        : {
            status: filter as
              | "pending"
              | "verified"
              | "rejected"
              | "refunded",
          }
    );

    setPayments(res.data || []);
  } catch (error: any) {
    Alert.alert("Error", error.userMessage);
  } finally {
    setIsLoading(false);
    setIsRefetching(false);
  }
};

  // ✅ রেভিনিউ রিপোর্ট fetch করা
const fetchRevenue = async () => {
  try {
    const res = await paymentService.adminRevenue();

    console.log("Revenue Response:", res);

    setRevenue(res); // ✅ not res.data
  } catch (error: any) {
    Alert.alert("Error", error.userMessage);
  }
};

  // ✅ filter বদলালে payments আবার fetch করুন
  useEffect(() => {
    fetchPayments();
  }, [filter]);

  // ✅ mount হওয়ার সময় একবার revenue নিয়ে আসুন
  useEffect(() => {
    fetchRevenue();
  }, []);

  // ✅ পেমেন্ট verify/reject করার ফাংশন
const verifyPayment = async (
  id: string,
  status: "verified" | "rejected" | "refunded"
) => {
  try {
    setIsPending(true);

    await paymentService.adminVerify(id, {
      status,
      note:
        status === "verified"
          ? "Payment confirmed."
          : "Payment rejected.",
    });

    Alert.alert("Success", `Payment ${status} successfully.`);

    fetchPayments(true);
    fetchRevenue();
  } catch (error: any) {
    Alert.alert("Error", error.userMessage);
  } finally {
    setIsPending(false);
  }
};

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const PayCard = ({ item }: { item: any }) => {
    const sc = statusColor(item.status);
    return (
      <View style={[styles.card, { borderRadius: s(14) }]}>
        <View style={styles.cardTop}>
          <View style={[styles.iconBox, { width: s(44), height: s(44), borderRadius: s(10), backgroundColor: item.isFree ? '#E8F5E9' : '#EEF2FF' }]}>
            <Ionicons name={item.isFree ? 'gift-outline' : 'card-outline'} size={s(20)} color={item.isFree ? '#2E7D32' : '#2D60FF'} />
          </View>
          <View style={{ flex: 1, marginLeft: s(10) }}>
            <Text style={[styles.userName,  { fontSize: s(13) }]}>{item.user?.name}</Text>
            <Text style={[styles.userEmail, { fontSize: s(11) }]}>{item.user?.email}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.badgeText, { color: sc.text, fontSize: s(11) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.amountRow}>
          <View>
            <Text style={[styles.amountLabel, { fontSize: s(11) }]}>Package</Text>
            <Text style={[styles.amountVal,   { fontSize: s(12) }]}>{item.package?.name}</Text>
          </View>
          <View>
            <Text style={[styles.amountLabel, { fontSize: s(11) }]}>Method</Text>
            <Text style={[styles.amountVal,   { fontSize: s(12) }]}>{item.paymentMethod?.toUpperCase()}</Text>
          </View>
          <View>
            <Text style={[styles.amountLabel, { fontSize: s(11) }]}>Amount</Text>
            <Text style={[styles.amountVal,   { fontSize: s(15), color: '#2D60FF', fontWeight: '700' }]}>
              {item.isFree ? 'FREE' : `৳${item.finalAmount}`}
            </Text>
          </View>
        </View>

        {item.transactionId && (
          <View style={styles.txRow}>
            <Ionicons name="receipt-outline" size={s(12)} color="#888" />
            <Text style={[styles.txText, { fontSize: s(11) }]}>TXN: {item.transactionId}</Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={s(12)} color="#aaa" />
          <Text style={[styles.metaText, { fontSize: s(11) }]}>{formatDate(item.createdAt)}</Text>
          {item.advertisement?.title && (
            <>
              <Text style={{ color: '#ddd' }}>·</Text>
              <Text style={[styles.metaText, { fontSize: s(11) }]} numberOfLines={1}>{item.advertisement.title}</Text>
            </>
          )}
        </View>

        {item.status === 'pending' && !item.isFree && (
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E8F5E9', flex: 1 }]}
              disabled={isPending}
              
          onPress={() => verifyPayment(item._id, "verified")}
              
              
              >
              <Ionicons name="checkmark-circle" size={s(14)} color="#2E7D32" />
              <Text style={[styles.actionText, { color: '#2E7D32', fontSize: s(12) }]}>Verify</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFEBEE', flex: 1 }]}
              disabled={isPending}
            onPress={() => verifyPayment(item._id, "rejected")}
              
              >
              <Ionicons name="close-circle" size={s(14)} color="#C62828" />
              <Text style={[styles.actionText, { color: '#C62828', fontSize: s(12) }]}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.revBanner}>
        <Ionicons name="trending-up" size={20} color="#2D60FF" />
        <Text style={styles.revLabel}>Total Revenue:</Text>
        <Text style={styles.revVal}>৳{revenue?.totalRevenue ?? 0}</Text>
        <Text style={[styles.revLabel, { marginLeft: 'auto' }]}>Orders: {revenue?.totalOrders ?? 0}</Text>
      </View>
<ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.filterRow}
    contentContainerStyle={styles.filterContent}
>

        {STATUSES.map((st) => (
          <TouchableOpacity key={st}
            style={[styles.filterChip, filter === st && styles.filterChipActive]}
            onPress={() => setFilter(st)}>
            <Text style={[styles.filterText, filter === st && styles.filterTextActive]}>
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#2D60FF" /></View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <PayCard item={item} />}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="wallet-outline" size={48} color="#ddd" />
              <Text style={styles.emptyText}>No payments found</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => fetchPayments(true)} colors={['#2D60FF']} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FA",
  },

  list: {
    padding: 16,
    paddingTop: 12,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  emptyText: {
    marginTop: 10,
    color: "#9CA3AF",
    fontSize: 15,
    fontWeight: "500",
  },

  // Revenue Banner
  revBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF3FF",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  revLabel: {
    marginLeft: 6,
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 14,
  },

  revVal: {
    marginLeft: 4,
    color: "#2D60FF",
    fontWeight: "700",
    fontSize: 17,
  },

  // Filter
  filterRow: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },

  filterContent: {
    paddingHorizontal: 16,
    gap: 10,
  },

  filterChip: {
    height: 40,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#F3F4F6",
    borderRadius: 22,

    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  filterChipActive: {
    backgroundColor: "#2D60FF",
    borderColor: "#2D60FF",

    shadowColor: "#2D60FF",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 3,
  },

  filterText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 13,
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: {
          width: 0,
          height: 3,
        },
      },
      android: {
        elevation: 3,
      },
    }),
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
  },

  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  userEmail: {
    marginTop: 3,
    color: "#6B7280",
    fontSize: 14,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    fontWeight: "700",
    fontSize: 12,
  },

  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  amountLabel: {
    color: "#9CA3AF",
    fontSize: 13,
  },

  amountVal: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  txRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },

  txText: {
    marginLeft: 8,
    color: "#4B5563",
    fontSize: 14,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  metaText: {
    marginLeft: 6,
    color: "#9CA3AF",
    flex: 1,
    fontSize: 13,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  actionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },

  actionText: {
    fontSize: 14,
    fontWeight: "700",
  },
});