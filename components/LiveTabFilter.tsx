import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TabType = 'running' | 'future' | 'completed';

interface LiveTabFilterProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: { running: number; future: number; completed: number };
}

export default function LiveTabFilter({ activeTab, onTabChange, counts }: LiveTabFilterProps) {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'running', label: `🟢 Running (${counts.running})` },
    { id: 'future', label: `⏱️ Future (${counts.future})` },
    { id: 'completed', label: `✅ Completed (${counts.completed})` },
  ];

  return (
    <View style={styles.liveTabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.liveTab, activeTab === tab.id && styles.activeLiveTab]}
          onPress={() => onTabChange(tab.id)}
        >
          <Text style={[styles.liveTabText, activeTab === tab.id && styles.activeLiveTabText]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  liveTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 4,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  liveTab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  activeLiveTab: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
  },
  liveTabText: { fontSize: 11, fontWeight: '600', color: '#64748b' },
  activeLiveTabText: { color: '#0f172a', fontWeight: '700' },
});