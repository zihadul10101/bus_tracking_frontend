import { colors } from "@/constants/colors";
import { DepartmentResearch } from "@/src/types/Research.service.types";
import { Building2 } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
    item: DepartmentResearch
}

export default function DepartmentCard({ item }: Props) {

    return (

        <View style={styles.card}>

            <Building2
                size={28}
                color={colors.primary}
            />

            <View style={{ marginLeft: 12 }}>

                <Text style={styles.name}>
                    {item.department}
                </Text>

                <Text style={styles.count}>
                    {item.count} Papers
                </Text>

            </View>

        </View>

    )

}

const styles = StyleSheet.create({

    card: {
        backgroundColor: "#fff",
        padding: 16,
        marginBottom: 12,
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center"
    },

    name: {
        fontWeight: "700",
        fontSize: 16
    },

    count: {
        marginTop: 3,
        color: "#6B7280"
    }

})