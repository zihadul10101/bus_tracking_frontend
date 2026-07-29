import { Driver, driverService } from '@/src/services/driverService';
import { router, useLocalSearchParams } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditDriver() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);


  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  useEffect(() => {
    if (id) {
      setLoading(true);
      driverService.getById(id)
        .then((res: any) => {
          const driverData = res.data ? res.data : res;
          if (driverData) {
            setDriver(driverData);
            setName(driverData.name || '');
            setMobile(driverData.mobile || '');
            setLicenseNumber(driverData.licenseNumber || '');
            setLoginName(driverData.loginName || '');
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          Alert.alert("Error", "Failed to fetch driver details");
          setLoading(false);
        });
    }
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    
    if (!name || !mobile || !licenseNumber || !loginName) {
      Alert.alert("Validation Error", "All fields except password are required!");
      return;
    }

    setActionLoading(true);
    try {
     
      const updatedFields: any = { name, mobile, licenseNumber, loginName };
      
      if (password.trim().length > 0) {
        if (password.length < 6) {
          Alert.alert("Validation Error", "Password must be at least 6 characters long.");
          setActionLoading(false);
          return;
        }
        updatedFields.password = password; 
      }

      await driverService.update(id, updatedFields);
      Alert.alert("Success", "Driver profile updated successfully!");
      setActionLoading(false);
      router.back();
    } catch (error: any) {
      setActionLoading(false);
      Alert.alert("Error", error.message || "Failed to update driver");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10, color: '#64748b' }}>Loading Driver Details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      {actionLoading && <ActivityIndicator size="small" color="#2563eb" style={{ alignSelf: 'center' }} />}
      
      {driver ? (
        <View style={{ gap: 14 }}>
          <View>
            <Text style={styles.label}>Driver Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />
          </View>
          
          <View>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput style={styles.input} value={mobile} onChangeText={setMobile} placeholder="Mobile" keyboardType="phone-pad" />
          </View>

          <View>
            <Text style={styles.label}>License Number</Text>
            <TextInput style={styles.input} value={licenseNumber} onChangeText={setLicenseNumber} placeholder="License" />
          </View>

          <View>
            <Text style={styles.label}>Login Name</Text>
            <TextInput
              style={styles.input}
              value={loginName}
              onChangeText={setLoginName}
              placeholder="Login Name"
              autoCapitalize="none"
            />
          </View>

       
          <View>
            <Text style={styles.label}>New Password (Optional)</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Leave blank to keep unchanged"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#64748b" />
                ) : (
                  <Eye size={20} color="#64748b" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.hintText}>পাসওয়ার্ড পরিবর্তন করতে না চাইলে ঘরটি ফাঁকা রাখুন।</Text>
          </View>

          <View style={{ marginTop: 10 }}>
            <Button title="Save Changes" onPress={handleUpdate} color="#2563eb" disabled={actionLoading} />
          </View>
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={{ color: '#ef4444' }}>Driver data not found!</Text>
        </View>
      )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', padding: 10, borderRadius: 8, fontSize: 16, backgroundColor: '#f8fafc' },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    width: '100%',
  },
  passwordInput: {
    flex: 1,
    minWidth: 0,
    padding: 10,
    fontSize: 16,
    color: '#0f172a',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  hintText: { fontSize: 11, color: '#94a3b8', marginTop: 4, fontStyle: 'italic' }
});