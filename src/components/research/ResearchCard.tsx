import {
  BookOpen,
  Calendar,
  ExternalLink,
  GraduationCap,
  User,
} from "lucide-react-native";
import React from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "@/constants/colors";
import { Research } from "@/src/types/Research.service.types";

interface Props {
  item: Research;
}

export default function ResearchCard({ item }: Props) {
  const handleOpenPaper = async () => {
    if (!item.paperLink) return;

    const supported = await Linking.canOpenURL(item.paperLink);

    if (supported) {
      Linking.openURL(item.paperLink);
    }
  };

  return (
    <View style={styles.card}>
      {/* Paper Title */}
      <Text style={styles.title}>{item.paperTitle}</Text>

      {/* Author */}
      <View style={styles.row}>
        <User size={16} color={colors.primary} />
        <Text style={styles.text}>{item.fullName}</Text>
      </View>

      {/* Department */}
      <View style={styles.row}>
        <GraduationCap size={16} color={colors.primary} />
        <Text style={styles.text}>{item.department}</Text>
      </View>

      {/* Journal */}
      <View style={styles.row}>
        <BookOpen size={16} color={colors.primary} />
        <Text style={styles.text}>{item.journalName}</Text>
      </View>

      {/* Year */}
      <View style={styles.row}>
        <Calendar size={16} color={colors.primary} />
        <Text style={styles.text}>
          {item.publicationYear} • {item.indexing}
        </Text>
      </View>

      {/* Keywords */}
      {item.keywords?.length > 0 && (
        <View style={styles.keywordContainer}>
          {item.keywords.slice(0, 4).map((keyword, index) => (
            <View key={index} style={styles.keywordChip}>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={handleOpenPaper}
      >
        <ExternalLink size={18} color="#fff" />

        <Text style={styles.buttonText}>View Paper</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  text: {
    marginLeft: 10,
    color: "#4B5563",
    fontSize: 14,
    flex: 1,
  },

  keywordContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },

  keywordChip: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
    marginRight: 8,
    marginBottom: 8,
  },

  keywordText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 12,
  },

  button: {
    marginTop: 15,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,

    justifyContent: "center",
    alignItems: "center",

    flexDirection: "row",
  },

  buttonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "700",
    fontSize: 15,
  },
});