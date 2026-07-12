import { driverService } from '@/src/services/driverService';
import { router } from 'expo-router';
import { ArrowLeft, CreditCard, Lock, LogIn, Phone, Save, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateDriver() {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    licenseNumber: '',
    loginName: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const { name, mobile, licenseNumber, loginName, password } = form;

    // 🔍 বেসিক ফ্রন্টএন্ড ভ্যালিডেশন
    if (!name || !mobile || !licenseNumber || !loginName || !password) {
      Alert.alert("Validation Error", "All fields are required!");
      return;
    }

    if (mobile.length < 11) {
      Alert.alert("Validation Error", "Please enter a valid mobile number.");
      return;
    }

    try {
      setSubmitting(true);
      
      // 🚀 এপিআই রিকোয়েস্ট পাঠানো
      const response = await driverService.create({
        name: name.trim(),
        mobile: mobile.trim(),
        licenseNumber: licenseNumber.trim(),
        loginName: loginName.trim().toLowerCase(), // ইউজারনেম সবসময় লোয়ারকেস রাখা ভালো
        password: password,
        role: 'driver'
      });

      if (response.success) {
        Alert.alert("Success", "Driver profile created successfully!");
        router.back(); // সফল হলে আগের লিস্ট স্ক্রিনে ব্যাক করবে
      } else {
        Alert.alert("Failed", response.message || "Could not create driver");
      }
    } catch (error: any) {
      console.error("Create Driver Error:", error);
      Alert.alert("Error", error.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* ⬅️ হেডার ব্যাক বাটন */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Driver</Text>
      </View>

      <View style={styles.formContainer}>
        {/* ১. ড্রাইভারের নাম */}
        <Text style={styles.label}>Driver Name</Text>
        <View style={styles.inputContainer}>
          <User size={18} color="#64748b" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Azadul Islam"
            placeholderTextColor="#94a3b8"
            value={form.name}
            onChangeText={(val) => handleChange('name', val)}
          />
        </View>

        {/* ২. মোবাইল নাম্বার */}
        <Text style={styles.label}>Mobile Number</Text>
        <View style={styles.inputContainer}>
          <Phone size={18} color="#64748b" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. 01610181160"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            value={form.mobile}
            onChangeText={(val) => handleChange('mobile', val)}
          />
        </View>

        {/* ৩. লাইসেন্স নাম্বার */}
        <Text style={styles.label}>License Number</Text>
        <View style={styles.inputContainer}>
          <CreditCard size={18} color="#64748b" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Sub-450"
            placeholderTextColor="#94a3b8"
            value={form.licenseNumber}
            onChangeText={(val) => handleChange('licenseNumber', val)}
          />
        </View>

        {/* ৪. লগইন ইউজারনেম */}
        <Text style={styles.label}>Login Username</Text>
        <View style={styles.inputContainer}>
          <LogIn size={18} color="#64748b" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. zihadul_islam"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            value={form.loginName}
            onChangeText={(val) => handleChange('loginName', val)}
          />
        </View>

        {/* ৫. পাসওয়ার্ড */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputContainer}>
          <Lock size={18} color="#64748b" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={form.password}
            onChangeText={(val) => handleChange('password', val)}
          />
        </View>

        {/* 💾 সাবমিট বাটন */}
        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.disabledButton]} 
          onPress={handleSave}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Save size={18} color="#fff" />
              <Text style={styles.submitButtonText}>Save Driver Profile</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingTop: 20, 
    paddingBottom: 12, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  backButton: { padding: 6, borderRadius: 8, backgroundColor: '#f1f5f9', marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  formContainer: { padding: 20, gap: 14 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: -4 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#cbd5e1', 
    borderRadius: 10, 
    paddingHorizontal: 12 
  },
  icon: { marginRight: 8 },
  input: { flex: 1, height: 48, color: '#1e293b', fontSize: 15 },
  submitButton: { 
    flexDirection: 'row', 
    backgroundColor: '#2563eb', 
    height: 50, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8,
    marginTop: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
  },
  disabledButton: { backgroundColor: '#94a3b8' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});