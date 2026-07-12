import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import {
  BookOpen,
  Calendar,
  CheckSquare,
  FileText,
  Link as LinkIcon,
  Paperclip,
  Square,
  Tag,
  Users,
  X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import ResearchService from '@/src/services/research.service';

const INDEXING_OPTIONS = ['Scopus', 'Web of Science', 'Other', 'Not Sure'];

export default function SubmitResearch() {
  const [paperTitle, setPaperTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [journalName, setJournalName] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [paperLink, setPaperLink] = useState('');
  const [indexing, setIndexing] = useState('Not Sure');
  const [keywords, setKeywords] = useState('');
  const [declaration, setDeclaration] = useState(false);
  const [file, setFile] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length) {
        setFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not pick the document');
    }
  };

  const validate = (isDraft: boolean) => {
    if (isDraft) return true; 
    if (!paperTitle.trim()) return 'Paper Title is required';
    if (!journalName.trim()) return 'Journal / Conference Name is required';
    if (!publicationYear.trim() || isNaN(Number(publicationYear)))
      return 'Valid Publication Year is required';
    if (!paperLink.trim()) return 'Paper Link is required';
    if (!declaration) return 'Please confirm the declaration checkbox';
    return true;
  };

  const handleSubmit = async (isDraft: boolean) => {
    const validation = validate(isDraft);
    if (validation !== true) {
      Alert.alert('Missing Information', validation as string);
      return;
    }

    isDraft ? setSavingDraft(true) : setSubmitting(true);

    try {
      const pickedFile = file
        ? {
            uri: file.uri,
            name: file.name || 'document.pdf',
            type: file.mimeType || 'application/pdf',
          }
        : undefined;

      const data = await ResearchService.submitResearch(
        {
          paperTitle,
          authors,
          journalName,
          publicationYear,
          paperLink,
          indexing,
          keywords,
          declaration,
          isDraft,
        },
        pickedFile
      );

      if (!data.success) {
        Alert.alert('Submission Failed', data.message || 'Something went wrong');
        return;
      }

      Alert.alert(
        isDraft ? 'Saved as Draft' : 'Submitted Successfully',
        isDraft
          ? 'Your research has been saved as a draft.'
          : 'Your research has been submitted for admin review.',
        [{ text: 'OK', onPress: () => router.push('/(tabs)/research/my-submissions' as any) }]
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Could not connect to server';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
      setSavingDraft(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Submit Research Paper</Text>
          <Text style={styles.headerSubtitle}>
            Fill in the details below. Your submission will be reviewed by admin before publishing.
          </Text>
        </View>

        {/* Paper Title */}
        <Field label="Paper Title" icon={<FileText size={16} color="#64748b" />} required>
          <TextInput
            style={styles.input}
            placeholder="e.g. Deep Learning Approaches for Bengali NLP"
            value={paperTitle}
            onChangeText={setPaperTitle}
          />
        </Field>

        {/* Authors */}
        <Field label="Authors (Co-authors)" icon={<Users size={16} color="#64748b" />}>
          <TextInput
            style={styles.input}
            placeholder="Comma separated, e.g. Rahim Uddin, Karim Ahmed"
            value={authors}
            onChangeText={setAuthors}
          />
        </Field>

        {/* Journal Name */}
        <Field label="Journal / Conference Name" icon={<BookOpen size={16} color="#64748b" />} required>
          <TextInput
            style={styles.input}
            placeholder="e.g. Springer Neural Computing and Applications"
            value={journalName}
            onChangeText={setJournalName}
          />
        </Field>

        {/* Publication Year */}
        <Field label="Publication Year" icon={<Calendar size={16} color="#64748b" />} required>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2025"
            value={publicationYear}
            onChangeText={setPublicationYear}
            keyboardType="number-pad"
            maxLength={4}
          />
        </Field>

        {/* Paper Link */}
        <Field label="Paper Link (DOI / Official URL)" icon={<LinkIcon size={16} color="#64748b" />} required>
          <TextInput
            style={styles.input}
            placeholder="https://doi.org/..."
            value={paperLink}
            onChangeText={setPaperLink}
            autoCapitalize="none"
            keyboardType="url"
          />
        </Field>

        {/* Indexing */}
        <Field label="Indexing" icon={<Tag size={16} color="#64748b" />}>
          <View style={styles.chipRow}>
            {INDEXING_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, indexing === opt && styles.chipActive]}
                onPress={() => setIndexing(opt)}
              >
                <Text style={[styles.chipText, indexing === opt && styles.chipTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        {/* Keywords */}
        <Field label="Research Area / Keywords (Optional)" icon={<Tag size={16} color="#64748b" />}>
          <TextInput
            style={styles.input}
            placeholder="Comma separated, e.g. NLP, deep learning, transformers"
            value={keywords}
            onChangeText={setKeywords}
          />
        </Field>

        {/* File Upload */}
        <Field label="Acceptance Letter / First Page (Optional)" icon={<Paperclip size={16} color="#64748b" />}>
          {file ? (
            <View style={styles.fileRow}>
              <FileText size={16} color="#3b82f6" />
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              <TouchableOpacity onPress={() => setFile(null)}>
                <X size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
              <Paperclip size={16} color="#3b82f6" />
              <Text style={styles.uploadBtnText}>Choose file (PDF/JPG/PNG)</Text>
            </TouchableOpacity>
          )}
        </Field>

        {/* Declaration */}
        <TouchableOpacity
          style={styles.declarationRow}
          onPress={() => setDeclaration(!declaration)}
          activeOpacity={0.7}
        >
          {declaration ? (
            <CheckSquare size={20} color="#3b82f6" />
          ) : (
            <Square size={20} color="#94a3b8" />
          )}
          <Text style={styles.declarationText}>
            I confirm that the information provided is accurate.
          </Text>
        </TouchableOpacity>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.draftBtn, savingDraft && styles.btnDisabled]}
            onPress={() => handleSubmit(true)}
            disabled={savingDraft || submitting}
          >
            {savingDraft ? (
              <ActivityIndicator color="#3b82f6" size="small" />
            ) : (
              <Text style={styles.draftBtnText}>Save as Draft</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.btnDisabled]}
            onPress={() => handleSubmit(false)}
            disabled={submitting || savingDraft}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Request</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, icon, required, children }: any) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        {icon}
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 18 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  field: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  label: { fontSize: 13.5, fontWeight: '600', color: '#334155' },
  required: { color: '#ef4444' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1e293b',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  chipText: { fontSize: 12.5, color: '#64748b', fontWeight: '600' },
  chipTextActive: { color: '#3b82f6' },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  fileName: { flex: 1, fontSize: 13, color: '#1e40af', fontWeight: '500' },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 14,
    justifyContent: 'center',
  },
  uploadBtnText: { fontSize: 13, color: '#3b82f6', fontWeight: '600' },
  declarationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 24,
    paddingHorizontal: 2,
  },
  declarationText: { flex: 1, fontSize: 13, color: '#334155', lineHeight: 18 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  draftBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftBtnText: { color: '#3b82f6', fontWeight: '700', fontSize: 14 },
  submitBtn: {
    flex: 1.3,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnDisabled: { opacity: 0.6 },
});