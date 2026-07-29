import { authService } from '@/src/services/authService';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { height } = Dimensions.get('window');

// At least 6 characters, 1 uppercase, 1 lowercase & 1 special character
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;'])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']{6,}$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [step, setStep] = useState('email'); // 'email' | 'reset' | 'success'
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // STEP 1: verify email exists
  const handleVerifyEmail = async () => {
    if (!email) {
      return Alert.alert("Required", "Please enter your email address");
    }

    setLoading(true);

    try {
      const data = await authService.forgotPassword(
        email.toLowerCase().trim()
      );

      console.log("Forgot Password:", data);

      setStep("reset");
    } catch (error: any) {
      console.log(error);

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
        "No account found with this email"
      );
    } finally {
      setLoading(false);
    }
  };
  // STEP 2: submit new password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      return Alert.alert(
        "Required",
        "Please fill in both password fields"
      );
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert(
        "Mismatch",
        "Passwords do not match"
      );
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters and include 1 uppercase, 1 lowercase & 1 special character"
      );
    }

    setLoading(true);

    try {
      const data = await authService.resetPassword(
        email.toLowerCase().trim(),
        newPassword,
        confirmPassword
      );


      setStep("success");
    } catch (error: any) {
      console.log(error);

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
        "Could not reset password"
      );
    } finally {
      setLoading(false);
    }
  };
  const headerText = () => {
    if (step === 'email') return { title: 'Forgot Password', subtitle: 'Enter your email to receive a password reset code' };
    if (step === 'reset') return { title: 'Reset Password', subtitle: 'Enter and confirm your new password' };
    return { title: 'All Set', subtitle: 'Your password has been changed successfully' };
  };
  const { title, subtitle } = headerText();

  return (
    <View style={styles.container}>
      {/* Blue Header Section */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (step === 'reset' ? setStep('email') : router.back())}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>

      {/* Floating Card UI Element */}
      <View style={styles.formCardContainer}>
        <View style={styles.formCard}>

          {step === 'email' && (
            <>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  style={styles.inputField}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleVerifyEmail}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === 'reset' && (
            <>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter new password"
                  placeholderTextColor="#9ca3af"
                  style={styles.inputField}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#9ca3af" />
                  ) : (
                    <Eye size={20} color="#9ca3af" />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.helperText}>
                At least 6 characters, 1 uppercase, 1 lowercase & 1 special character
              </Text>

              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  placeholder="Confirm new password"
                  placeholderTextColor="#9ca3af"
                  style={styles.inputField}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#9ca3af" />
                  ) : (
                    <Eye size={20} color="#9ca3af" />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === 'success' && (
            <>
              <View style={styles.successIconWrap}>
                <CheckCircle2 size={64} color="#22c55e" />
              </View>
              <Text style={styles.successText}>
                Your password was reset successfully. You can now log in with your new password.
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setStep("email");
                  setEmail("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setShowPassword(false);
                  setShowConfirmPassword(false);

                  router.replace("/(auth)");
                }}
              >
                <Text style={styles.buttonText}>Back to Login</Text>
              </TouchableOpacity>

            </>
          )}

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007bff'
  },
  headerContainer: {
    height: height * 0.26,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    lineHeight: 22
  },
  formCardContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 20
  },
  inputIcon: {
    marginRight: 12
  },
  inputField: {
    flex: 1,
    color: '#1f2937',
    fontSize: 15
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: -14,
    marginBottom: 20,
    lineHeight: 16
  },
  primaryButton: {
    backgroundColor: '#007bff',
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  successIconWrap: {
    alignItems: 'center',
    marginBottom: 16
  },
  successText: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20
  }
});