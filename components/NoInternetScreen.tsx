import { MaterialCommunityIcons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function NoInternetScreen() {
  const refresh = async () => {
    await NetInfo.fetch();
  };

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="wifi-off"
        size={100}
        color="#2563eb"
      />

      <Text style={styles.title}>
        No Internet Connection
      </Text>

      <Text style={styles.subtitle}>
        Check your internet and try again.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={refresh}
      >
        <Text style={styles.buttonText}>
          Refresh
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  title: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "700",
    color: "#555",
  },

  subtitle: {
    marginTop: 8,
    color: "#777",
    fontSize: 16,
    textAlign: "center",
  },

  button: {
    marginTop: 30,
    backgroundColor: "#2563eb",
    paddingHorizontal: 35,
    paddingVertical: 12,
    borderRadius: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});