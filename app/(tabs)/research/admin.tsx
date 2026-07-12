import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  User,
  X,
  XCircle
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import ResearchService from '@/src/services/research.service';

const STATUS_TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'changes_requested', label: 'Changes Req.' },
];

type ModalAction = 'reject' | 'request-changes' | null;

export default function AdminResearchReview() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const [activePaper, setActivePaper] = useState<any>(null);
  const [reasonText, setReasonText] = useState('');

  const fetchPapers = useCallback(async () => {
    try {
      const res = await ResearchService.getAllForAdmin({ status: status as any });
      if (res.success) setPapers(res.data || []);
    } catch (error) {
      console.error('Error fetching admin research list:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [status]);

  useEffect(() => {
    setLoading(true);
    fetchPapers();
  }, [fetchPapers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPapers();
  }, [fetchPapers]);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await ResearchService.approveResearch(id);
      if (res.success) {
        setPapers((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (error) {
      console.error('Approve failed:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const openModal = (paper: any, action: ModalAction) => {
    setActivePaper(paper);
    setModalAction(action);
    setReasonText('');
  };

  const closeModal = () => {
    setModalAction(null);
    setActivePaper(null);
    setReasonText('');
  };

  const submitModal = async () => {
    if (!reasonText.trim() || !activePaper) return;

    setProcessingId(activePaper._id);
    try {
      const res =
        modalAction === 'reject'
          ? await ResearchService.rejectResearch(activePaper._id, { reason: reasonText.trim() })
          : await ResearchService.requestChanges(activePaper._id, { note: reasonText.trim() });

      if (res.success) {
        setPapers((prev) => prev.filter((p) => p._id !== activePaper._id));
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setProcessingId(null);
      closeModal();
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.paperTitle} numberOfLines={2}>{item.paperTitle}</Text>

      <View style={styles.applicantRow}>
        <User size={13} color="#94a3b8" />
        <Text style={styles.applicantText}>{item.fullName} • {item.department}</Text>
      </View>

      <Text style={styles.journalName} numberOfLines={1}>{item.journalName}</Text>

      <View style={styles.metaRow}>
        <Calendar size={13} color="#94a3b8" />
        <Text style={styles.metaText}>{item.publicationYear}</Text>
        {item.indexing && (
          <View style={styles.indexBadge}>
            <Text style={styles.indexBadgeText}>{item.indexing}</Text>
          </View>
        )}
      </View>

      {item.paperLink && (
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => Linking.openURL(item.paperLink)}
        >
          <ExternalLink size={13} color="#3b82f6" />
          <Text style={styles.linkBtnText}>View Paper Link</Text>
        </TouchableOpacity>
      )}

      {item.verificationDocument && (
        <View style={styles.docNoteRow}>
          <Text style={styles.docNote}>📎 Verification document attached</Text>
        </View>
      )}

      {status === 'pending' && (
        <View style={styles.actionsRow}>
          {processingId === item._id ? (
            <ActivityIndicator size="small" color="#3b82f6" style={{ marginVertical: 8 }} />
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => handleApprove(item._id)}
                activeOpacity={0.8}
              >
                <CheckCircle2 size={15} color="#fff" />
                <Text style={styles.actionBtnTextWhite}>Approve</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.changesBtn]}
                onPress={() => openModal(item, 'request-changes')}
                activeOpacity={0.8}
              >
                <AlertCircle size={15} color="#7c3aed" />
                <Text style={styles.actionBtnTextPurple}>Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => openModal(item, 'reject')}
                activeOpacity={0.8}
              >
                <XCircle size={15} color="#dc2626" />
                <Text style={styles.actionBtnTextRed}>Reject</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {item.status === 'rejected' && item.rejectionReason && (
        <View style={styles.noteBox}>
          <Text style={styles.noteLabel}>Rejection Reason</Text>
          <Text style={styles.noteText}>{item.rejectionReason}</Text>
        </View>
      )}

      {item.status === 'changes_requested' && item.changeRequestNote && (
        <View style={[styles.noteBox, { backgroundColor: '#f5f3ff' }]}>
          <Text style={[styles.noteLabel, { color: '#7c3aed' }]}>Change Note</Text>
          <Text style={styles.noteText}>{item.changeRequestNote}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Research Review</Text>
        <Text style={styles.headerSubtitle}>Approve, reject, or request changes</Text>
      </View>

      <View style={styles.filterBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {STATUS_TABS.map((item) => {
            const isActive = status === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setStatus(item.key)}
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
                <Clock size={40} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyTitle}>
                No {status.replace('_', ' ')} submissions
              </Text>
              <Text style={styles.emptySubtitle}>
                {status === 'pending'
                  ? "You're all caught up — nothing waiting for review"
                  : 'Nothing to show in this category right now'}
              </Text>
            </View>
          }
        />
      )}

      {/* Reject / Request Changes Modal */}
      <Modal visible={!!modalAction} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalAction === 'reject' ? 'Reject Submission' : 'Request Changes'}
              </Text>
              <TouchableOpacity onPress={closeModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalPaperTitle} numberOfLines={2}>
              {activePaper?.paperTitle}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder={
                modalAction === 'reject'
                  ? 'Enter reason for rejection...'
                  : 'Describe what changes are needed...'
              }
              placeholderTextColor="#94a3b8"
              value={reasonText}
              onChangeText={setReasonText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={closeModal} activeOpacity={0.7}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  modalAction === 'reject' ? styles.modalSubmitReject : styles.modalSubmitChanges,
                  !reasonText.trim() && styles.btnDisabled,
                ]}
                onPress={submitModal}
                disabled={!reasonText.trim()}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSubmitText}>
                  {modalAction === 'reject' ? 'Confirm Rejection' : 'Send Request'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 4 },
  headerTitle: { fontSize: 21, fontWeight: '700', color: '#1e293b' },
  headerSubtitle: { fontSize: 12.5, color: '#94a3b8', marginTop: 2 },

  filterBarWrapper: {
    height: 46,
    marginTop: 12,
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
  paperTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', lineHeight: 20 },
  applicantRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  applicantText: { fontSize: 12.5, color: '#64748b', fontWeight: '500' },
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
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  linkBtnText: { fontSize: 12.5, color: '#3b82f6', fontWeight: '600' },
  docNoteRow: { marginTop: 8 },
  docNote: { fontSize: 12, color: '#16a34a', fontWeight: '500' },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 9,
  },
  approveBtn: { backgroundColor: '#16a34a' },
  changesBtn: { backgroundColor: '#f5f3ff', borderWidth: 1, borderColor: '#ddd6fe' },
  rejectBtn: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  actionBtnTextWhite: { color: '#fff', fontSize: 12, fontWeight: '700' },
  actionBtnTextPurple: { color: '#7c3aed', fontSize: 12, fontWeight: '700' },
  actionBtnTextRed: { color: '#dc2626', fontSize: 12, fontWeight: '700' },
  noteBox: { backgroundColor: '#fef2f2', borderRadius: 8, padding: 10, marginTop: 10 },
  noteLabel: { fontSize: 11, fontWeight: '700', color: '#dc2626', marginBottom: 2 },
  noteText: { fontSize: 12.5, color: '#475569', lineHeight: 17 },

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
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#334155', textAlign: 'center', textTransform: 'capitalize' },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  modalPaperTitle: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 13.5,
    minHeight: 90,
    color: '#1e293b',
  },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  modalCancelText: { color: '#64748b', fontWeight: '700', fontSize: 14 },
  modalSubmitBtn: { flex: 1.4, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  modalSubmitReject: { backgroundColor: '#dc2626' },
  modalSubmitChanges: { backgroundColor: '#7c3aed' },
  modalSubmitText: { color: '#fff', fontWeight: '700', fontSize: 13.5 },
  btnDisabled: { opacity: 0.5 },
});