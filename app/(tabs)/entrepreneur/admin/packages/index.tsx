import { packageService } from "@/src/services/entrepreneur";
import { useNavigation } from "@react-navigation/native";
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



interface Package {
    _id: string;
    name: string;
    description?: string;
    durationDays: number;
    price: number;
    isFree: boolean;
    features: string[];
    maxAdsPerStudent: number;
    isActive: boolean;
}

const PackageListScreen = () => {
    const navigation = useNavigation<any>();

    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

const getPackages = async () => {
  try {
    const response = await packageService.getAll();

    if (response.success) {
      setPackages(response.data || []);
    }
  } catch (error: any) {
    console.log(error);

    Alert.alert(
      "Error",
      error.userMessage || "Failed to load packages."
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};
const deletePackage = (id: string) => {
  Alert.alert(
    "Delete Package",
    "Are you sure you want to delete this package?",
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
            const response = await packageService.delete(id);

            if (response.success) {
              Alert.alert(
                "Success",
                "Package deleted successfully."
              );

              getPackages();
            }
          } catch (error: any) {
            Alert.alert(
              "Error",
              error.userMessage || "Unable to delete package."
            );
          }
        },
      },
    ]
  );
};

    useEffect(() => {
        getPackages();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getPackages();
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
                data={packages}
                keyExtractor={(item) => item._id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListHeaderComponent={() => (
                    <Text style={styles.header}>
                        Advertisement Packages
                    </Text>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            No Packages Found
                        </Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.packageName}>
                                {item.name}
                            </Text>

                            <View
                                style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor: item.isFree
                                            ? "#4CAF50"
                                            : "#0A84FF",
                                    },
                                ]}
                            >
                                <Text style={styles.statusText}>
                                    {item.isFree ? "FREE" : "PAID"}
                                </Text>
                            </View>
                        </View>

                        {!!item.description && (
                            <Text style={styles.description}>
                                {item.description}
                            </Text>
                        )}

                        <View style={styles.row}>
                            <Text style={styles.label}>Price</Text>
                            <Text style={styles.value}>
                                ৳ {item.price}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Duration</Text>
                            <Text style={styles.value}>
                                {item.durationDays} Days
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Max Ads</Text>
                            <Text style={styles.value}>
                                {item.maxAdsPerStudent}
                            </Text>
                        </View>

                        <Text style={styles.featureTitle}>
                            Features
                        </Text>

                        {item.features.length > 0 ? (
                            item.features.map((feature, index) => (
                                <Text
                                    key={index}
                                    style={styles.featureItem}
                                >
                                    • {feature}
                                </Text>
                            ))
                        ) : (
                            <Text style={styles.noFeature}>
                                No Features
                            </Text>
                        )}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => router.push(`/(tabs)/entrepreneur/admin/packages/edit/${item._id}` as any)}
                            >
                                <Text style={styles.buttonTitle}>
                                    Edit
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() =>
                                    deletePackage(item._id)
                                }
                            >
                                <Text style={styles.buttonTitle}>
                                    Delete
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() =>
                    router.push(
                        "/(tabs)/entrepreneur/admin/packages/create"
                    )
                }
            >
                <Text style={styles.fabText}>＋</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default PackageListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },

    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },

    header: {
        fontSize: 24,
        fontWeight: "700",
        color: "#222",
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
    },

    emptyContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 80,
    },

    emptyText: {
        fontSize: 18,
        color: "#777",
    },

    card: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 14,
        padding: 16,
        elevation: 3,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

    packageName: {
        flex: 1,
        fontSize: 20,
        fontWeight: "700",
        color: "#222",
        marginRight: 10,
    },

    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },

    statusText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },

    description: {
        color: "#666",
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 15,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },

    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#666",
    },

    value: {
        fontSize: 15,
        fontWeight: "700",
        color: "#111",
    },

    featureTitle: {
        marginTop: 15,
        marginBottom: 8,
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
    },

    featureItem: {
        fontSize: 14,
        color: "#555",
        marginBottom: 6,
        lineHeight: 20,
    },

    noFeature: {
        fontSize: 14,
        color: "#999",
        fontStyle: "italic",
    },

    buttonRow: {
        flexDirection: "row",
        marginTop: 20,
        justifyContent: "space-between",
    },

    editButton: {
        flex: 1,
        backgroundColor: "#2196F3",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginRight: 8,
    },

    deleteButton: {
        flex: 1,
        backgroundColor: "#E53935",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginLeft: 8,
    },

    buttonTitle: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
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

        elevation: 8,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },

    fabText: {
        color: "#fff",
        fontSize: 34,
        fontWeight: "300",
        marginTop: -2,
    },
});