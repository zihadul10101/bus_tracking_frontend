// screens/LiveLocation.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LiveLocation({ route }) {
  const { busId } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>বাস {busId} - লাইভ লোকেশন</Text>
      <View style={styles.mapPlaceholder}>
        <Text>ম্যাপ লোড হচ্ছে...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  mapPlaceholder: { flex: 1, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
});