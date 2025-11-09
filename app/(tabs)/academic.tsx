import BookExchange from '@/components/ui/academic/BookExchange';
import EmergencyContacts from '@/components/ui/academic/EmergencyContacts';
import NoticeBoard from '@/components/ui/academic/NoticeBoard';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/colors';



export default function AcademicPage() {
  const [active, setActive] = useState<'books' | 'notices' | 'emergency'>('books');

  const tabs = [
    { id: 'books', label: 'Book Exchange' },
    { id: 'notices', label: 'Notices' },
    { id: 'emergency', label: 'Emergency' },
  ];

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {/* 🔘 Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setActive(t.id as any)}
            style={{
              backgroundColor: active === t.id ? colors.primary : colors.card,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              marginRight: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: active === t.id ? colors.primaryForeground : colors.mutedForeground }}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 📚 Conditional Content */}
      <View style={{ flex: 1 }}>
        {active === 'books' && <BookExchange />}
        {active === 'notices' && <NoticeBoard />}
        {active === 'emergency' && <EmergencyContacts />}
      </View>
    </ScrollView>
  );
}
