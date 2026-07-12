// src/components/SubAdminForm.tsx
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

// 🔐 আপনার ব্যাকএন্ড ডাটাবেজের অবজেক্ট স্ট্রাকচার অনুযায়ী ইন্টারফেস
interface Permissions {
  canManageBuses: boolean;
  canManageStudents: boolean;
  canPostNotices: boolean;
  canViewTracking: boolean;
}

interface FormProps {
  initialValues?: { 
    name: string; 
    email: string; 
    permissions?: Permissions 
  };
  onSubmit: (values: { name: string; email: string; password?: string; permissions: Permissions }) => void;
  submitButtonText: string;
  isEditMode?: boolean;
}

export default function SubAdminForm({ initialValues, onSubmit, submitButtonText, isEditMode = false }: FormProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [email, setEmail] = useState(initialValues?.email || '');
  const [password, setPassword] = useState('');
  
  // ⚙️ ব্যাকএন্ডের কী (Keys) গুলোর সাথে ডিফল্ট স্টেট ম্যাচ করা হলো
  const [permissions, setPermissions] = useState<Permissions>({
    canManageBuses: initialValues?.permissions?.canManageBuses ?? false,
    canManageStudents: initialValues?.permissions?.canManageStudents ?? false,
    canPostNotices: initialValues?.permissions?.canPostNotices ?? false,
    canViewTracking: initialValues?.permissions?.canViewTracking ?? false,
  });

  const togglePermission = (key: keyof Permissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = () => {
    if (!isEditMode && !password) {
      Alert.alert("Error", "Password is required for new sub-admin");
      return;
    }

    const formData: any = {
      name,
      email,
      permissions,
    };

    if (password.trim().length > 0) {
      formData.password = password;
    }

    onSubmit(formData);
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email Address" keyboardType="email-address" value={email} onChangeText={setEmail} />
      
      <TextInput 
        style={styles.input} 
        placeholder={isEditMode ? "New Password (Leave blank to keep unchanged)" : "Password"} 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword} 
      />

      <Text style={styles.sectionTitle}>Permissions:</Text>
      
      {/* ১. বাস ম্যানেজমেন্ট পারমিশন */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Can Manage Buses</Text>
        <Switch 
          value={permissions.canManageBuses} 
          onValueChange={() => togglePermission('canManageBuses')} 
        />
      </View>

      {/* ২. স্টুডেন্ট ম্যানেজমেন্ট পারমিশন */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Can Manage Students</Text>
        <Switch 
          value={permissions.canManageStudents} 
          onValueChange={() => togglePermission('canManageStudents')} 
        />
      </View>

      {/* ৩. নোটিশ পোস্ট পারমিশন */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Can Post Notices</Text>
        <Switch 
          value={permissions.canPostNotices} 
          onValueChange={() => togglePermission('canPostNotices')} 
        />
      </View>

      {/* ৪. ট্র্যাকিং ভিউ পারমিশন */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Can View Tracking</Text>
        <Switch 
          value={permissions.canViewTracking} 
          onValueChange={() => togglePermission('canViewTracking')} 
        />
      </View>

      <View style={{ marginTop: 16 }}>
        <Button title={submitButtonText} onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  input: { borderBottomWidth: 1, borderBottomColor: '#ccc', padding: 8, fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 10, color: '#334155' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  switchLabel: { fontSize: 15, color: '#475569' },
});