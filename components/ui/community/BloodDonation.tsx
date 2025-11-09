import { Calendar, Heart, MapPin, Phone } from 'lucide-react-native';
import React, { useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../constants/colors';

const donors = [
  { id: '1', name: 'Ahmed Hassan', bloodType: 'O+', location: 'Campus Hostel A', phone: '+12345678901', lastDonation: '3 months ago', available: true },
  { id: '2', name: 'Sarah Khan', bloodType: 'A+', location: 'Downtown Apartment', phone: '+12345678902', lastDonation: '2 months ago', available: true },
  { id: '3', name: 'Marcus Johnson', bloodType: 'B+', location: 'Campus Hostel B', phone: '+12345678903', lastDonation: '1 month ago', available: false },
];

export default function BloodDonation() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.section}>
      <View style={[styles.headerCard, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}>
        <Heart size={20} color="#dc2626" />
        <View>
          <Text style={styles.headerTitle}>Help Save Lives</Text>
          <Text style={styles.headerSubtitle}>Connect with blood donors in your community</Text>
        </View>
      </View>

      {donors.map(donor => (
        <TouchableOpacity
          key={donor.id}
          onPress={() => setSelected(selected === donor.id ? null : donor.id)}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>{donor.name}</Text>
          <View style={styles.row}>
            <MapPin size={14} color={colors.mutedForeground} />
            <Text style={styles.cardSubtitle}>{donor.location}</Text>
          </View>
          <View style={styles.row}>
            <Calendar size={14} color={colors.mutedForeground} />
            <Text style={styles.cardSubtitle}>Last donation: {donor.lastDonation}</Text>
          </View>

          {selected === donor.id && (
            <View style={styles.expanded}>
              <TouchableOpacity style={styles.row} onPress={() => Linking.openURL(`tel:${donor.phone}`)}>
                <Phone size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, marginLeft: 6 }}>{donor.phone}</Text>
              </TouchableOpacity>
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
