import { BookOpen, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../constants/colors';

const tutors = [
  { id: '1', name: 'Dr. Amira Patel', subject: 'Mathematics', rating: 4.9, reviews: 47, location: 'Campus Library' },
  { id: '2', name: 'James Chen', subject: 'Physics', rating: 4.8, reviews: 32, location: 'Science Building' },
];

export default function TuitionService() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <View style={styles.section}>
      <View style={[styles.headerCard, { backgroundColor: '#dbeafe', borderColor: '#bfdbfe' }]}>
        <BookOpen size={20} color="#1d4ed8" />
        <View>
          <Text style={styles.headerTitle}>Find a Tutor</Text>
          <Text style={styles.headerSubtitle}>Connect with experienced tutors for academic support</Text>
        </View>
      </View>

      {tutors.map(t => (
        <TouchableOpacity key={t.id} style={styles.card} onPress={() => setExpanded(expanded === t.id ? null : t.id)}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>{t.name}</Text>
            <View style={styles.row}>
              <Star size={14} color="#facc15" fill="#facc15" />
              <Text style={styles.cardTitle}>{t.rating}</Text>
            </View>
          </View>
          <Text style={[styles.cardSubtitle, { color: colors.primary }]}>{t.subject}</Text>
          <Text style={styles.cardSubtitle}>📍 {t.location}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  headerCard: { flexDirection: 'row', gap: 8, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  headerTitle: { fontWeight: '600', fontSize: 14 },
  headerSubtitle: { fontSize: 12, color: colors.mutedForeground },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginVertical: 4 },
  cardTitle: { fontWeight: '600', fontSize: 14 },
  cardSubtitle: { fontSize: 12, color: colors.mutedForeground },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
