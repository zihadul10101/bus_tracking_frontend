import { busService } from '@/src/services/busService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bus as BusIcon, Edit3, Hash } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../../constants/colors';

export default function EditBusScreen() {
  const { id } = useLocalSearchParams(); // ডাইনামিক [id] রিসিভ করা হচ্ছে
  const router = useRouter();
  
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form States
  const [busName, setBusName] = useState('');
  const [busNo, setBusNo] = useState('');

  // 🔄 এক্সিস্টিং বাসের ডাটা লোড করার ইফেক্ট
  useEffect(() => {
    const loadBusDetails = async () => {
      try {
        setFetching(true);
        const res = await busService.getBusById(id as string);
        if (res.success && res.data) {
          setBusName(res.data.busName);
          setBusNo(res.data.busNo);
        } else {
          Alert.alert("Error", "Bus data not found");
          router.back();
        }
      } catch (err: any) {
        Alert.alert("Error", err.userMessage || err.message || "Failed to fetch bus details");
      } finally {
        setFetching(false);
      }
    };

    if (id) loadBusDetails();
  }, [id]);

  const handleUpdateBus = async () => {
    if (!busName.trim() || !busNo.trim()) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }

    const updatedBusData = {
      busName: busName.trim(),
      busNo: busNo.trim(),
    };

    try {
      setLoading(true);
      // busService এ বাসের ডাটা আপডেট করার API কল মেথড
      const res = await busService.updateBus(id as string, updatedBusData);
      if (res.success) {
        Alert.alert("Updated", "Bus details updated successfully!");
        router.back();
      }
    } catch (err: any) {
      Alert.alert("Error", err.userMessage || err.message || "Failed to update bus");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Update Bus Name / Title</Text>
      <View style={styles.inputContainer}>
        <BusIcon size={18} color="#64748b" style={styles.inputIcon} />
        <TextInput 
          style={styles.input} 
          value={busName} 
          onChangeText={setBusName} 
          placeholderTextColor="#94a3b8"
          placeholder="Enter bus name"
        />
      </View>

      <Text style={styles.label}>Update Bus Number / Plate No</Text>
      <View style={styles.inputContainer}>
        <Hash size={18} color="#64748b" style={styles.inputIcon} />
        <TextInput 
          style={styles.input} 
          value={busNo} 
          onChangeText={setBusNo} 
          placeholderTextColor="#94a3b8"
          placeholder="Enter plate number"
        />
      </View>

      <TouchableOpacity 
        style={[styles.submitBtn, { backgroundColor: '#10b981', shadowColor: '#10b981' }]} 
        onPress={handleUpdateBus} 
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : (
          <View style={styles.btnContent}>
            <Edit3 size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.submitBtnText}>Update Bus Info</Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

// 🎨 মডার্ন এবং ক্লিন ইউজার ইন্টারফেসের জন্য স্টাইলশিট
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc', 
    padding: 16 
  },
  loader: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 50
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#475569', 
    marginBottom: 6, 
    marginTop: 16 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    paddingHorizontal: 12, 
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: { 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    color: '#1e293b', 
    fontSize: 15,
    height: '100%'
  },
  submitBtn: { 
    height: 52, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 32, 
    elevation: 3, 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginBottom: 40 
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitBtnText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700' 
  }
});