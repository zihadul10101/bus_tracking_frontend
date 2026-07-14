import { useApp } from "@/src/context/AppContext";
import { authService } from "@/src/services/authService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CURVE_HEIGHT = 50;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useApp();

  // ✅ FIX: `checkingSession` state পুরোপুরি বাদ দেওয়া হলো — session চেক
  // এখন শুধু AppContext/RootLayout এ একবারই হয় (cold start এ)। এই স্ক্রিন
  // মাউন্ট হওয়ার সাথে সাথে RootLayout ইতিমধ্যে জানে user logged-in কিনা,
  // তাই এখানে আবার AsyncStorage চেক করে আলাদা loading spinner দেখানোর
  // দরকার নেই। এতে logout থেকে এই স্ক্রিনে এলে কোনো flash হয় না।
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("সতর্কতা", "ইমেইল এবং পাসওয়ার্ড দিন");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(email.trim(), password);

      if (data.success) {
        // ✅ FIX: AppContext.login() কল করা হচ্ছে — এটা user state আপডেট
        // করবে + storage এ সেভ করবে + ব্যাকগ্রাউন্ডে ডেটা রিফ্রেশ করবে।
        // authService.login() নিজেও storage এ লিখেছে (পুরনো কোড রাখা
        // অবস্থায়), কিন্তু AppContext.login() সেই একই key তে আবার লিখে
        // in-memory state আপডেট করে, যেটা RootLayout/Drawer কে জানায়।
        await login(data.user, data.token, data.role);
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("লগইন ব্যর্থ", data.message || "ইমেইল/পাসওয়ার্ড সঠিক নয়");
      }
    } catch (error: any) {
      Alert.alert("লগইন ব্যর্থ", error?.message || "কিছু একটা সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>

          {/* --- HEADER SECTION --- */}
          <View style={styles.headerContainer}>
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.backButton}>
                <Ionicons name="arrow-back" size={26} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Welcome Back</Text>
              <Text style={styles.headerSubtitle}>
                Login to your account to continue
              </Text>
            </View>

            <Svg
              width={SCREEN_WIDTH}
              height={CURVE_HEIGHT}
              style={styles.headerCurve}
              viewBox={`0 0 ${SCREEN_WIDTH} ${CURVE_HEIGHT}`}
            >
              <Path
                d={`M0,0 
                    C${SCREEN_WIDTH * 0.25},${CURVE_HEIGHT * 1.5} ${SCREEN_WIDTH * 0.75},${CURVE_HEIGHT * 1.5} ${SCREEN_WIDTH},0 
                    L${SCREEN_WIDTH},${CURVE_HEIGHT} L0,${CURVE_HEIGHT} Z`}
                fill="#0B6BFF"
              />
            </Svg>
          </View>

          {/* --- MAIN LOGIN CARD --- */}
          <View style={styles.card}>

            {/* Email Input */}
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#8A8F98" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="abc@gmail.com"
                placeholderTextColor="#9AA0A8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#8A8F98" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9AA0A8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#8A8F98"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotWrapper}
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerWrapper}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.registerWrapper}>
              <Text style={styles.registerText}>Are You Driver? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/driver-login")}>
                <Text style={styles.registerLink}>Driver</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B6BFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F3F5F8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  headerContainer: {
    height: 220,
    backgroundColor: "#0B6BFF",
    position: "relative",
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    marginBottom: 24,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.85)",
  },
  headerCurve: {
    position: "absolute",
    bottom: -1,
    left: 0,
  },

  card: {
    backgroundColor: "#ffffff",
    marginTop: -40,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1D23",
    marginBottom: 8,
    marginTop: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F6F9",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1A1D23",
  },

  forgotWrapper: {
    alignSelf: "flex-end",
    marginTop: 12,
    paddingVertical: 4,
  },
  forgotText: {
    color: "#0B6BFF",
    fontSize: 13,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#0B6BFF",
    borderRadius: 12,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerText: {
    color: "#6B7280",
    fontSize: 14,
  },
  registerLink: {
    color: "#0B6BFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});