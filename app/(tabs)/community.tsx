import BloodDonation from '@/components/ui/community/BloodDonation';
import HousingFinder from '@/components/ui/community/HousingFinder';
import TuitionService from '@/components/ui/community/TuitionService';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/colors';


export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'blood' | 'housing' | 'tuition'>('blood');

  return (
    <View style={styles.container}>
      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('blood')}
          style={[styles.toggleButton, activeTab === 'blood' ? styles.activeTab : styles.inactiveTab]}
        >
          <Text style={[styles.tabText, activeTab === 'blood' ? styles.activeText : styles.inactiveText]}>
            Blood Donation
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('housing')}
          style={[styles.toggleButton, activeTab === 'housing' ? styles.activeTab : styles.inactiveTab]}
        >
          <Text style={[styles.tabText, activeTab === 'housing' ? styles.activeText : styles.inactiveText]}>
            Housing Finder
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('tuition')}
          style={[styles.toggleButton, activeTab === 'tuition' ? styles.activeTab : styles.inactiveTab]}
        >
          <Text style={[styles.tabText, activeTab === 'tuition' ? styles.activeText : styles.inactiveText]}>
            Tuition Service
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conditional Content */}
      <ScrollView style={{ flex: 1 }}>
        {activeTab === 'blood' && <BloodDonation />}
        {activeTab === 'housing' && <HousingFinder />}
        {activeTab === 'tuition' && <TuitionService />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 12 },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontWeight: '600',
    fontSize: 14,
  },
  activeText: {
    color: colors.primaryForeground,
  },
  inactiveText: {
    color: colors.mutedForeground,
  },
});
