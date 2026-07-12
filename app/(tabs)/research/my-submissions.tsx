import { router } from 'expo-router';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  FileText,
  Plus,
  XCircle
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import ResearchService from '@/src/services/research.service';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  draft: { label: 'Draft', color: '#64748b', bg: '#f1f5f9', icon: Edit3 },
  pending: { label: 'Pending Review', color: '#d97706', bg: '#fffbeb', icon: Clock },
  approved: { label: 'Approved', color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: '#dc2626', bg: '#fef2f2', icon: XCircle },
  changes_requested: { label: 'Changes Requested', color: '#7c3aed', bg: '#f5f3ff', icon: AlertCircle },
};

const FILTER_TABS = [
  { key: null, label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'draft', label: 'Draft' },
];

export default function MySubmissions() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await ResearchService.getMySubmissions(
        filter ? { status: filter as any } : undefined
      );
      if (res.success) setPapers(res.data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    ResearchService.markAllAsViewed().catch((error) => {
      console.error('Failed to mark as viewed:', error);
    });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSubmissions();
  }, [fetchSubmissions]);

  const renderItem = ({ item }: { item: any }) => {
    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const StatusIcon = config.icon;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.paperTitle} numberOfLines={2}>{item.paperTitle}</Text>
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <StatusIcon size={12} color={config.color} />
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>

        <Text style={styles.journalName} numberOfLines={1}>
          {item.journalName || 'No journal set'}
        </Text>

        <View style={styles.metaRow}>
          <Calendar size={13} color="#94a3b8" />
          <Text style={styles.metaText}>{item.publicationYear || '—'}</Text>
          {item.indexing && (
            <View style={styles.indexBadge}>
              <Text style={styles.indexBadgeText}>{item.indexing}</Text>
            </View>
          )}
        </View>

        {item.status === 'rejected' && item.rejectionReason && (
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>Rejection Reason</Text>
            <Text style={styles.noteText}>{item.rejectionReason}</Text>
          </View>
        )}

        {item.status === 'changes_requested' && item.changeRequestNote && (
          <View style={[styles.noteBox, { backgroundColor: '#f5f3ff' }]}>
            <Text style={[styles.noteLabel, { color: '#7c3aed' }]}>Changes Requested</Text>
            <Text style={styles.noteText}>{item.changeRequestNote}</Text>
          </View>
        )}

        <View style={styles.cardActions}>
          {item.paperLink ? (
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => Linking.openURL(item.paperLink)}
            >
              <ExternalLink size={13} color="#3b82f6" />
              <Text style={styles.linkBtnText}>View Paper</Text>
            </TouchableOpacity>
          ) : <View />}

          {['draft', 'pending', 'changes_requested'].includes(item.status) && (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push({
                pathname: '/(tabs)/research/submit',
                params: { editId: item._id }
              } as any)}
            >
              <Edit3 size={13} color="#64748b" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Research</Text>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/research/submit' as any)}
        >
          <Plus size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_TABS.map((item) => {
            const isActive = filter === item.key;
            return (
              <TouchableOpacity
                key={String(item.key)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setFilter(item.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#3b82f6" />
      ) : (
        <FlatList
          data={papers}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingTop: 12, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <FileText size={40} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyTitle}>
                {filter ? `No ${filter.replace('_', ' ')} submissions` : 'No research submissions yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                Share your published work with the university community
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                activeOpacity={0.85}
                onPress={() => router.push('/(tabs)/research/submit' as any)}
              >
                <Plus size={15} color="#fff" />
                <Text style={styles.emptyBtnText}>Submit your first paper</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 4,
  },
  headerTitle: { fontSize: 21, fontWeight: '700', color: '#1e293b' },
  addBtn: {
    backgroundColor: '#3b82f6',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  filterBarWrapper: {
    height: 46,
    marginTop: 10,
    marginBottom: 4,
  },
  filterRow: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  filterChipText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  paperTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1e293b', lineHeight: 20 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    height: 24,
  },
  statusText: { fontSize: 10.5, fontWeight: '700' },
  journalName: { fontSize: 13, color: '#64748b', marginTop: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  metaText: { fontSize: 12, color: '#94a3b8' },
  indexBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  indexBadgeText: { fontSize: 10.5, color: '#3b82f6', fontWeight: '700' },
  noteBox: { backgroundColor: '#fef2f2', borderRadius: 8, padding: 10, marginTop: 10 },
  noteLabel: { fontSize: 11, fontWeight: '700', color: '#dc2626', marginBottom: 2 },
  noteText: { fontSize: 12.5, color: '#475569', lineHeight: 17 },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  linkBtnText: { fontSize: 12.5, color: '#3b82f6', fontWeight: '600' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  editBtnText: { fontSize: 12.5, color: '#64748b', fontWeight: '600' },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingHorizontal: 30,
  },
  emptyIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#334155', textAlign: 'center' },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13.5 },
});