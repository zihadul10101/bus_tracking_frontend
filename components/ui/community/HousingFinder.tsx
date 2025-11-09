import { Home, MapPin } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../constants/colors';

const housings = [
  { id: '1', title: 'Cozy Studio Near Campus', type: 'Studio', location: 'University Avenue', price: 450, bedrooms: 1, contact: 'Ali Ahmed' },
  { id: '2', title: 'Shared 2BR Apartment', type: 'Apartment', location: 'Downtown District', price: 350, bedrooms: 2, contact: 'Fatima Khan' },
];

export default function HousingFinder() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <View style={styles.section}>
      <View style={[styles.headerCard, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
        <Home size={20} color="#d97706" />
        <View>
          <Text style={styles.headerTitle}>Find Your Home</Text>
          <Text style={styles.headerSubtitle}>Browse available housing options for students</Text>
        </View>
      </View>

      {housings.map(h => (
        <TouchableOpacity key={h.id} style={styles.card} onPress={() => setOpen(open === h.id ? null : h.id)}>
          <Text style={styles.cardTitle}>{h.title}</Text>
          <View style={styles.row}>
            <MapPin size={14} color={colors.mutedForeground} />
            <Text style={styles.cardSubtitle}>{h.location}</Text>
          </View>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>${h.price}/month</Text>

          {open === h.id && (
            <View style={styles.expanded}>
              <Text style={styles.cardSubtitle}>Contact: {h.contact}</Text>
            </View>
          )}
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
  expanded: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 8 },
});
