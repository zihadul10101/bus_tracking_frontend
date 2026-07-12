import { colors } from "@/constants/colors";
import { TopResearcher } from "@/src/types/Research.service.types";
import { Award } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
    item: TopResearcher
}

export default function TopResearcherCard({ item }: Props) {

    return (

        <View style={styles.card}>

            <Award
                size={28}
                color="#F59E0B"
            />

            <View style={{ marginLeft: 12, flex: 1 }}>

                <Text style={styles.name}>
                    {item.fullName}
                </Text>

                <Text style={styles.department}>
                    {item.department}
                </Text>

                <Text style={styles.count}>
                    {item.publicationCount} Publications
                </Text>

            </View>

        </View>

    )

}

const styles = StyleSheet.create({

    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 15,
        marginBottom: 14,
        flexDirection: "row",
        alignItems: "center"
    },

    name: {
        fontWeight: "700",
        fontSize: 16
    },

    department: {
        marginTop: 3,
        color: "#6B7280"
    },

    count: {
        marginTop: 5,
        color: colors.primary,
        fontWeight: "700"
    }

})