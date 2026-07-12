import { couponService } from "@/src/services/entrepreneur";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";



interface Coupon {
    _id: string;
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    usageLimit?: number;
    usedCount?: number;
    expiresAt?: string;
    isActive: boolean;
    appliesTo?: "new" | "renewal" | "both";
}

const CouponListScreen = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const getCoupons = async () => {
        try {
            setLoading(true);

            const res = await couponService.adminGetAll();

            console.log("Coupons:", res);

            if (res.success) {
                setCoupons(res.data ?? []);
            }
        } catch (error: any) {
            console.log(error);

            Alert.alert(
                "Error",
                error.userMessage || error.message || "Failed to load coupons."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const deleteCoupon = (id: string) => {
        Alert.alert(
            "Delete Coupon",
            "Are you sure you want to delete this coupon?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await couponService.delete(id);

                            Alert.alert("Success", "Coupon deleted successfully.");

                            getCoupons();
                        } catch (error: any) {
                            console.log(error);

                            Alert.alert(
                                "Error",
                                error.userMessage ||
                                error.message ||
                                "Failed to delete coupon."
                            );
                        }
                    },
                },
            ]
        );
    };

    useEffect(() => {
        getCoupons();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getCoupons();
    }, []);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator
                    size="large"
                    color="#0A84FF"
                />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={coupons}
                keyExtractor={(item) => item._id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListHeaderComponent={
                    <Text style={styles.header}>
                        Coupon Management
                    </Text>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            No Coupons Found
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        {/* Header */}
                        <View style={styles.cardHeader}>
                            <Text style={styles.code}>
                                {item.code}
                            </Text>

                            <View
                                style={[
                                    styles.badge,
                                    {
                                        backgroundColor: item.isActive
                                            ? "#4CAF50"
                                            : "#F44336",
                                    },
                                ]}
                            >
                                <Text style={styles.badgeText}>
                                    {item.isActive
                                        ? "ACTIVE"
                                        : "INACTIVE"}
                                </Text>
                            </View>
                        </View>

                        {/* Discount */}
                        <View style={styles.row}>
                            <Text style={styles.label}>
                                Discount
                            </Text>

                            <Text style={styles.value}>
                                {item.discountType ===
                                    "percentage"
                                    ? `${item.discountValue}%`
                                    : `৳ ${item.discountValue}`}
                            </Text>
                        </View>

                        {/* Minimum Purchase */}
                        <View style={styles.row}>
                            <Text style={styles.label}>
                                Minimum Purchase
                            </Text>

                            <Text style={styles.value}>
                                ৳ {item.minOrderAmount ?? 0}
                            </Text>
                        </View>

                        {/* Max Discount */}
                        <View style={styles.row}>
                            <Text style={styles.label}>
                                Max Discount
                            </Text>

                            <Text style={styles.value}>
                                ৳ {item.maxDiscount}
                            </Text>
                        </View>

                        {/* Usage */}
                        <View style={styles.row}>
                            <Text style={styles.label}>
                                Usage
                            </Text>

                            <Text style={styles.value}>
                                {item.usedCount ?? 0} / {item.usageLimit ?? "∞"}

                            </Text>
                        </View>

                        {/* Expiry */}
                        <View style={styles.row}>
                            <Text style={styles.label}>
                                Expires
                            </Text>

                            <Text style={styles.value}>
                                {item.expiresAt
                                    ? new Date(
                                        item.expiresAt
                                    ).toLocaleDateString()
                                    : "-"}
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Applies To</Text>

                            <Text style={styles.value}>
                                {item.appliesTo?.toUpperCase() ?? "BOTH"}
                            </Text>
                        </View>
                        {/* Buttons */}
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    styles.editButton,
                                ]}
                                onPress={() => router.push(`/(tabs)/entrepreneur/admin/coupons/edit/${item._id}` as any)}
                            >
                                <Text
                                    style={styles.actionText}
                                >
                                    Edit
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    styles.deleteButton,
                                ]}
                                onPress={() =>
                                    deleteCoupon(item._id)
                                }
                            >
                                <Text
                                    style={styles.actionText}
                                >
                                    Delete
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            {/* Floating Add Button */}

            <TouchableOpacity
                style={styles.fab}
                onPress={() =>
                    router.push(
                        "/(tabs)/entrepreneur/admin/coupons/create"
                    )
                }
            >
                <Text style={styles.fabText}>
                    ＋
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default CouponListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },

    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFF",
    },

    header: {
        fontSize: 26,
        fontWeight: "700",
        color: "#222",
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 80,
    },

    emptyText: {
        fontSize: 18,
        color: "#888",
        fontWeight: "600",
    },

    card: {
        backgroundColor: "#FFF",
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 14,
        padding: 16,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,

        elevation: 3,
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },

    code: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111",
    },

    badge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },

    badgeText: {
        color: "#FFF",
        fontSize: 12,
        fontWeight: "700",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },

    label: {
        fontSize: 15,
        color: "#666",
        fontWeight: "600",
    },

    value: {
        fontSize: 15,
        color: "#222",
        fontWeight: "700",
    },

    actionRow: {
        flexDirection: "row",
        marginTop: 20,
    },

    actionButton: {
        flex: 1,
        height: 45,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
    },

    editButton: {
        backgroundColor: "#0A84FF",
        marginRight: 8,
    },

    deleteButton: {
        backgroundColor: "#E53935",
        marginLeft: 8,
    },

    actionText: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "700",
    },

    fab: {
        position: "absolute",
        right: 20,
        bottom: 25,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#0A84FF",
        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,

        elevation: 8,
    },

    fabText: {
        color: "#FFF",
        fontSize: 34,
        fontWeight: "300",
        marginTop: -2,
    },
});