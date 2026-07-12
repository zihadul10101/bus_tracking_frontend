import { Search, X } from "lucide-react-native";
import React from "react";
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
}

export default function ResearchSearch({
  value,
  onChangeText,
  onClear,
}: Props) {
  return (
    <View style={styles.container}>
      <Search size={20} color="#6B7280" />

      <TextInput
        placeholder="Search papers, authors, journals..."
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        returnKeyType="search"
      />

      {value.length > 0 && (
        <TouchableOpacity onPress={onClear}>
          <X size={20} color="#6B7280" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,

    backgroundColor: "#fff",

    borderRadius: 14,

    paddingHorizontal: 15,

    flexDirection: "row",

    alignItems: "center",

    marginVertical: 15,

    shadowColor: "#000",

    shadowOpacity: 0.06,

    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  input: {
    flex: 1,

    marginLeft: 10,

    color: "#111827",

    fontSize: 15,
  },
});