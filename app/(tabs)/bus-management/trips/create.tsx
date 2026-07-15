import { busService } from '@/src/services/busService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, MapPin, Plus, Trash2, Type } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../../constants/colors';

const AVAILABLE_DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const DAY_MAPPER: { [key: string]: string } = {
  'Sat': 'Saturday', 'Sun': 'Sunday', 'Mon': 'Monday', 'Tue': 'Tuesday',
  'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday'
};

const TIME_REGEX = /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i;

interface DynamicStop {
  stopName: string;
  time: string;
}

export default function CreateTripScreen() {
  const { busId } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form States
  const [tripTitle, setTripTitle] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const [stops, setStops] = useState<DynamicStop[]>([
    { stopName: '', time: '' }, // Sequence 1 (Departure)
    { stopName: '', time: '' }, // Sequence 2 (Destination)
  ]);


  const addStopField = () => {
    setStops([...stops, { stopName: '', time: '' }]);
  };

  const removeStopField = (index: number) => {
    if (stops.length <= 2) {
      Alert.alert("Warning", "At least 2 stops (Start & End) are required!");
      return;
    }
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleInputChange = (index: number, field: keyof DynamicStop, value: string) => {
    const updatedStops = [...stops];
    updatedStops[index][field] = value;
    setStops(updatedStops);
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleCreateTrip = async () => {

    if (!tripTitle.trim() || selectedDays.length === 0) {
      Alert.alert("Validation Error", "Please fill up Trip Title and select at least one day.");
      return;
    }

    const formattedStops = [];
    
    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      
      if (!stop.stopName.trim()) {
        Alert.alert("Validation Error", `Stop Name for Stop #${i + 1} cannot be empty.`);
        return;
      }

      const cleanTime = stop.time.trim() ? stop.time.trim().replace(/\s+/g, ' ').toUpperCase() : null;

      if (cleanTime && !TIME_REGEX.test(cleanTime)) {
        Alert.alert("Format Error", `Time at "${stop.stopName}" (${cleanTime}) must be in valid 12-hour format (e.g., 07:30 AM)`);
        return;
      }

  
      formattedStops.push({
        stopName: stop.stopName.trim(),
        time: cleanTime,
        sequence: i + 1 
      });
    }

    const formattedDays = selectedDays.map(day => DAY_MAPPER[day]);

    const tripData = {
      tripTitle: tripTitle.trim(),
      days: formattedDays,
      stops: formattedStops 
    };

    try {
      setLoading(true);
      const res = await busService.addTrip(busId as string, tripData as any);
      
         
      if (res.success || res.data) {
        Alert.alert("Success", "New trip with multiple stops added successfully!");
       router.replace(`/(tabs)/bus-management/${busId}`);
      }
    } catch (err: any) {
      Alert.alert("Error", err.userMessage || err.message || "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Trip Title</Text>
      <View style={styles.inputContainer}>
        <Type size={18} color="#64748b" style={styles.inputIcon} />
        <TextInput 
          style={styles.input} 
          placeholder="e.g., Campus - 2 No Gate - Bahaddarhat" 
          value={tripTitle}
          onChangeText={setTripTitle}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* 🎯 ডায়নামিক স্টপেজ সেকশন */}
      <Text style={styles.sectionHeader}>Stops & Route Schedule</Text>
      
      {stops.map((stop, index) => (
        <View key={index} style={styles.stopCard}>
          <View style={styles.stopCardHeader}>
            <Text style={styles.stopBadge}>
              {index === 0 ? "Departure (Start)" : index === stops.length - 1 ? "Destination (End)" : `Stop #${index + 1}`}
            </Text>
            {index > 1 && ( 
              <TouchableOpacity onPress={() => removeStopField(index)}>
                <Trash2 size={18} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <MapPin size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Stop name" 
                value={stop.stopName} 
                onChangeText={(val) => handleInputChange(index, 'stopName', val)} 
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={[styles.inputContainer, { width: 125 }]}>
              <Clock size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="07:30 AM" 
                value={stop.time} 
                onChangeText={(val) => handleInputChange(index, 'time', val)} 
                placeholderTextColor="#94a3b8"
                autoCapitalize="characters"
              />
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addStopBtn} onPress={addStopField}>
        <Plus size={18} color={colors.primary} />
        <Text style={styles.addStopBtnText}>Add Intermediate Stop</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Active Days</Text>
      <View style={styles.daysContainer}>
        {AVAILABLE_DAYS.map((day) => {
          const isSelected = selectedDays.includes(day);
          return (
            <TouchableOpacity 
              key={day} 
              style={[styles.dayBadge, isSelected && styles.dayBadgeSelected]}
              onPress={() => toggleDay(day)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleCreateTrip} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Save Schedule</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 16 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginTop: 20, marginBottom: 10 },
  stopCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  stopCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  stopBadge: { fontSize: 12, fontWeight: '600', color: colors.primary, backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', 
    borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12, height: 46 
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: '#1e293b', fontSize: 14, height: '100%' },
  row: { flexDirection: 'row', alignItems: 'center' },
  addStopBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    padding: 12, borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.primary, gap: 6, marginTop: 4 
  },
  addStopBtnText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 24 },
  dayBadge: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', minWidth: 55, alignItems: 'center' },
  dayBadgeSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  dayTextSelected: { color: '#fff', fontWeight: '600' },
  submitBtn: { backgroundColor: colors.primary, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 40 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});