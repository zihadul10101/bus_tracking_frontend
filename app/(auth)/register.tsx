import { authService } from "@/src/services/authService";
import { useRouter } from 'expo-router';
import {
  AlertCircle,
  Building2,
  ChevronDown,
  Eye,
  EyeOff,
  IdCard,
  Lock,
  Mail,
  User
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { height } = Dimensions.get('window');

const DEPARTMENTS = [
  "Business Administration",
  "Computer Science & Engineering",
  "Computer Science & Information Technology",
  "Civil Engineering",
  "Electrical & Electronic Engineering (EEE)",
  "Electronic & Communication Engineering (ECE)",
  "Pharmacy",
  "Law",
  "English",
  "Islamic Studies",
  "General Education",
];

// ----- Validation helpers -----
// Format: each group 1-3 digits, 3 groups, dash-separated
// Valid examples: 666-60-09, 666-112-245, 1-2-3
const isValidStudentId = (id: string) => /^\d{1,3}-\d{1,3}-\d{1,3}$/.test(id.trim());

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidPassword = (password: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/.test(password);

// User নিজে dash টাইপ করবে — শুধু digit/dash রাখা হয়,
// প্রতিটা group max 3 digit-এ trim করা হয়, group সংখ্যা max 3
const formatStudentId = (raw: string) => {
  let cleaned = raw.replace(/[^0-9-]/g, '');
  let groups = cleaned.split('-');

  if (groups.length > 3) {
    groups = groups.slice(0, 3);
  }

  groups = groups.map((g) => g.slice(0, 3));

  return groups.join('-');
};

export default function RegisterScreen() {
  const router = useRouter();
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [showDeptModal, setShowDeptModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    departmentName: '',
    studentId: '',
    email: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    departmentName: '',
    studentId: '',
    email: '',
    password: '',
  });

  const validateForm = () => {
    const errors = {
      name: '',
      departmentName: '',
      studentId: '',
      email: '',
      password: '',
    };
    let isValid = true;

    if (!form.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!form.departmentName.trim()) {
      errors.departmentName = 'Please select a department';
      isValid = false;
    }

    if (!form.studentId.trim()) {
      errors.studentId = 'Student ID is required';
      isValid = false;
    } else if (!isValidStudentId(form.studentId)) {
      errors.studentId = 'Format: max 3 digits per group (e.g. 666-60-09 or 666-112-245)';
      isValid = false;
    }

    if (!form.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!isValidEmail(form.email)) {
      errors.email = 'Enter a valid email address';
      isValid = false;
    }

    if (!form.password.trim()) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (!isValidPassword(form.password)) {
      errors.password =
        'Password must be at least 6 characters with 1 uppercase, 1 lowercase & 1 special character';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleRegister = async () => {
    setNetworkError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await authService.registerStudent({
        name: form.name.trim(),
        studentId: form.studentId.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        departmentName: form.departmentName.trim(),
      });

      if (result?.success) {
        Alert.alert(
          "সফল!",
          "আপনার একাউন্ট তৈরি হয়েছে। এখন লগইন করুন।",
          [
            {
              text: "লগইন করুন",
              onPress: () => router.replace('/(auth)'),
            },
          ]
        );

        setForm({
          name: '',
          departmentName: '',
          studentId: '',
          email: '',
          password: '',
        });
      } else {
        setNetworkError(result?.message || "কিছু একটা সমস্যা হয়েছে");
      }
    } catch (error: any) {
      setNetworkError(
        error?.message || "নেটওয়ার্ক সমস্যা। ইন্টারনেট সংযোগ চেক করুন।"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={styles.scrollGrow}>


        <View style={styles.headerContainer}>


          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>
             Create your account to track your bus in real time
            </Text>
          </View>
        </View>

        <View style={styles.formCardContainer}>
          <View style={styles.formCard}>

            {networkError && (
              <View style={styles.errorAlertBox}>
                <AlertCircle size={20} color="#dc2626" style={{ marginRight: 8 }} />
                <Text style={styles.errorAlertText}>{networkError}</Text>
              </View>
            )}

            {/* Full Name */}
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={[styles.inputWrapper, fieldErrors.name && styles.inputWrapperError]}>
              <User size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                placeholder="Azadul Islam"
                placeholderTextColor="#9ca3af"
                style={styles.inputField}
                value={form.name}
                onChangeText={(text) => {
                  setForm({ ...form, name: text });
                  if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                }}
              />
            </View>
            {!!fieldErrors.name && <Text style={styles.fieldErrorText}>{fieldErrors.name}</Text>}

            {/* Department Dropdown */}
            <Text style={styles.inputLabel}>Department</Text>
            <TouchableOpacity
              style={[styles.inputWrapper, fieldErrors.departmentName && styles.inputWrapperError]}
              activeOpacity={0.8}
              onPress={() => setShowDeptModal(true)}
            >
              <Building2 size={20} color="#9ca3af" style={styles.inputIcon} />
              <Text
                style={[
                  styles.inputField,
                  { color: form.departmentName ? '#1f2937' : '#9ca3af' },
                ]}
              >
                {form.departmentName || 'Select your department'}
              </Text>
              <ChevronDown size={20} color="#9ca3af" />
            </TouchableOpacity>
            {!!fieldErrors.departmentName && (
              <Text style={styles.fieldErrorText}>{fieldErrors.departmentName}</Text>
            )}

            {/* Student ID */}
            <Text style={styles.inputLabel}>Student ID</Text>
            <View style={[styles.inputWrapper, fieldErrors.studentId && styles.inputWrapperError]}>
              <IdCard size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                placeholder="666-60-09"
                placeholderTextColor="#9ca3af"
                style={styles.inputField}
                value={form.studentId}
                onChangeText={(text) => {
                  const formatted = formatStudentId(text);
                  setForm({ ...form, studentId: formatted });
                  if (fieldErrors.studentId) setFieldErrors({ ...fieldErrors, studentId: '' });
                }}
                keyboardType="default"
                maxLength={11}
              />
            </View>
            {!!fieldErrors.studentId ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.studentId}</Text>
            ) : (
              <Text style={styles.hintText}>Max 3 digits per group (e.g. 666-60-09)</Text>
            )}

            {/* University Email */}
            <Text style={styles.inputLabel}>University Email</Text>
            <View style={[styles.inputWrapper, fieldErrors.email && styles.inputWrapperError]}>
              <Mail size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                placeholder="student@southern.edu.bd"
                placeholderTextColor="#9ca3af"
                style={styles.inputField}
                value={form.email}
                onChangeText={(text) => {
                  setForm({ ...form, email: text });
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {!!fieldErrors.email && <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>}

            {/* Password */}
            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.inputWrapper, fieldErrors.password && styles.inputWrapperError]}>
              <Lock size={20} color="#9ca3af" style={styles.inputIcon} />

              <TextInput
                placeholder="e.g. Abc@123"
                placeholderTextColor="#9ca3af"
                style={styles.inputField}
                secureTextEntry={secureText}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                value={form.password}
                onChangeText={(text) => {
                  setForm({ ...form, password: text });
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                }}
              />
              <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                {secureText ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
              </TouchableOpacity>
            </View>
            {!!fieldErrors.password ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
            ) : (
              <Text style={styles.hintText}>
                At least 6 characters, 1 uppercase, 1 lowercase & 1 special character
              </Text>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
            </TouchableOpacity>

            <View style={styles.footerLinkRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)')}>
                <Text style={styles.linkText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Department Picker Modal */}
      <Modal
        visible={showDeptModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeptModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDeptModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Department</Text>
            <FlatList
              data={DEPARTMENTS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.deptOption}
                  onPress={() => {
                    setForm({ ...form, departmentName: item });
                    setFieldErrors({ ...fieldErrors, departmentName: '' });
                    setShowDeptModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.deptOptionText,
                      form.departmentName === item && styles.deptOptionTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#007bff' },
  scrollGrow: { flexGrow: 1 },
  headerContainer: {
    height: height * 0.24,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',        // ✅ সব চাইল্ড center-এ আনবে
    paddingTop: Platform.OS === 'ios' ? 45 : 20,
  },

  headerTextWrap: {
    alignItems: 'center',        // ✅ title + subtitle দুটোই center align
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // backButton: { alignSelf: 'flex-start', marginBottom: 12 },
  // headerTitle: { fontSize: 34, fontWeight: 'bold', color: '#fff' },
  // headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  formCardContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 16,
    paddingBottom: 24
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: -40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  errorAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  errorAlertText: {
    flex: 1,
    color: '#991b1b',
    fontSize: 14,
    fontWeight: '500',
  },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 14, paddingHorizontal: 16, height: 54 },
  inputWrapperError: { borderWidth: 1.5, borderColor: '#dc2626' },
  inputIcon: { marginRight: 12 },
  inputField: { flex: 1, color: '#1f2937', fontSize: 15 },
  fieldErrorText: { color: '#dc2626', fontSize: 12, marginTop: 4, marginLeft: 4 },
  hintText: { color: '#9ca3af', fontSize: 12, marginTop: 4, marginLeft: 4 },
  primaryButton: { backgroundColor: '#007bff', height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  buttonDisabled: { backgroundColor: '#9ca3af' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerLinkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#6b7280', fontSize: 14 },
  linkText: { color: '#007bff', fontWeight: 'bold', fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 16,
    maxHeight: height * 0.5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  deptOption: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  deptOptionText: { fontSize: 15, color: '#374151' },
  deptOptionTextActive: { color: '#007bff', fontWeight: '700' },
});