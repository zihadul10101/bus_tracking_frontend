import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from 'react-native-vector-icons/Feather';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // THIS IS THE ONLY LINE THAT WORKS 100%
  const API_URL = Platform.OS === 'android' 
    ? "http://127.0.0.1:5000" 
    : "http://localhost:5000";

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setError("");
    setLoading(true);
    console.log("Trying to login...");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password,
        }),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("userRole", data.role);
        await AsyncStorage.setItem("userEmail", email.toLowerCase());

        Alert.alert("Success!", `Welcome back, ${data.role}!`, [
          { text: "OK", onPress: () => router.replace("/(tabs)") }
        ]);
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err: any) {
      console.error("Network error:", err);
      setError("Cannot connect to server. Is Flask running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>sub_bus</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <View style={styles.inputWrapper}>
        <Icon name="mail" size={20} color="#888" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Icon name="lock" size={20} color="#888" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

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

      <View style={styles.links}>
        <TouchableOpacity onPress={() => router.push("/auth/forgot-password")}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/auth/register")}>
          <Text style={styles.linkText}>New user? Register</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.debug}>
        Connecting to: {API_URL}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
  },
  title: { 
    fontSize: 36, 
    fontWeight: "bold", 
    color: "#667eea",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  icon: { marginRight: 15 },
  input: {
    flex: 1,
    height: 60,
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    color: "#e74c3c",
    marginBottom: 20,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#667eea",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
    elevation: 8,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  buttonDisabled: { backgroundColor: "#aaa" },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  links: { 
    marginTop: 40, 
    alignItems: "center",
    gap: 18,
  },
  linkText: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "600",
  },
  debug: {
    marginTop: 30,
    textAlign: "center",
    color: "#888",
    fontSize: 12,
  }
});