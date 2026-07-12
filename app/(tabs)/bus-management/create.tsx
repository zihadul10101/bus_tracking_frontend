import { busService } from '@/src/services/busService';
import { useRouter } from 'expo-router';
import { Bus as BusIcon, Hash, Save } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../constants/colors';


export default function CreateBusScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form States
  const [busName, setBusName] = useState('');
  const [busNo, setBusNo] = useState('');

  const handleCreateBus = async () => {
    if (!busName.trim() || !busNo.trim()) {
      Alert.alert("Validation Error", "Please fill up all fields.");
      return;
    }

    const busData = {
      busName: busName.trim(),
      busNo: busNo.trim(),
    };

    try {
      setLoading(true);
      // busService এ আপনার নতুন বাস ক্রিয়েট করার API কল মেথড
      const res = await busService.createBus(busData);
      if (res.success || res.data) {
        Alert.alert("Success", "New bus added to fleet successfully!");
        router.back();
      }
    } catch (err: any) {
      // ✅ api.ts এর response interceptor থেকে আসা user-friendly মেসেজ প্রাধান্য পাবে
      Alert.alert("Error", err.userMessage || err.message || "Failed to create bus");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Bus Name / Title</Text>
      <View style={styles.inputContainer}>
        <BusIcon size={18} color="#64748b" style={styles.inputIcon} />
        <TextInput 
          style={styles.input} 
          placeholder="e.g., Shonali (শোনালী)" 
          value={busName}
          onChangeText={setBusName}
          placeholderTextColor="#94a3b8"
        />
      </View>

      <Text style={styles.label}>Bus Number / Plate No</Text>
      <View style={styles.inputContainer}>
        <Hash size={18} color="#64748b" style={styles.inputIcon} />
        <TextInput 
          style={styles.input} 
          placeholder="e.g., Chatt-Metro-Cha-11-2222" 
          value={busNo}
          onChangeText={setBusNo}
          placeholderTextColor="#94a3b8"
        />
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleCreateBus} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : (
          <View style={styles.btnContent}>
            <Save size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.submitBtnText}>Save Bus</Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc', 
    padding: 16 
  },
  loader: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
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
    backgroundColor: colors.primary, 
    height: 52, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 32, 
    elevation: 3, 
    shadowColor: colors.primary,
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