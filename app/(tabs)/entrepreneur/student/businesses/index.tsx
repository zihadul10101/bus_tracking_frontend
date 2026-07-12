import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
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

const API_URL =
  "http://192.168.0.195:5000/api/v1/entrepreneur/businesses/my/list";

const DELETE_API =
  "http://192.168.0.195:5000/api/v1/entrepreneur/businesses";

interface Business {
  _id: string;
  name: string;
  category: string;
  description: string;

  status: "pending" | "approved" | "rejected" | "suspended";

  isVerified: boolean;
  isFeatured: boolean;

  totalViews: number;
  averageRating: number;
  totalRatings: number;

  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };

  location: {
    city?: string;
    area?: string;
  };
}

const BusinessListScreen = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getBusinesses = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
       console.log("token",token);
       
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Businesses:", response.data);

      if (response.data.success) {
        setBusinesses(response.data.data);
      }
    } catch (error: any) {
      console.log(
        "Business Error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to load businesses."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const deleteBusiness = (id: string) => {
    Alert.alert(
      "Delete Business",
      "Are you sure you want to delete this business?",
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
              const token = await AsyncStorage.getItem(
                "userToken"
              );

              await axios.delete(`${DELETE_API}/${id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              Alert.alert(
                "Success",
                "Business deleted successfully."
              );

              getBusinesses();
            } catch (error: any) {
              console.log(
                error.response?.data || error.message
              );

              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "Delete failed."
              );
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    getBusinesses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getBusinesses();
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
        data={businesses}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListHeaderComponent={
          <Text style={styles.header}>
            My Businesses
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No Business Found
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.businessName}>
                  {item.name}
                </Text>

                <Text style={styles.category}>
                  {item.category}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      item.status === "approved"
                        ? "#4CAF50"
                        : item.status === "pending"
                        ? "#FF9800"
                        : item.status === "rejected"
                        ? "#F44336"
                        : "#607D8B",
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Description */}

            <Text style={styles.description}>
              {item.description}
            </Text>

            {/* Contact */}

            <View style={styles.row}>
              <Text style={styles.label}>
                Phone
              </Text>

              <Text style={styles.value}>
                {item.contact?.phone || "-"}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                Email
              </Text>

              <Text style={styles.value}>
                {item.contact?.email || "-"}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                Address
              </Text>

              <Text style={styles.value}>
                {item.contact?.address || "-"}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                City
              </Text>

              <Text style={styles.value}>
                {item.location?.city || "-"}
              </Text>
            </View>

            {/* Statistics */}

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {item.totalViews}
                </Text>

                <Text style={styles.statLabel}>
                  Views
                </Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {item.averageRating}
                </Text>

                <Text style={styles.statLabel}>
                  Rating
                </Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {item.totalRatings}
                </Text>

                <Text style={styles.statLabel}>
                  Reviews
                </Text>
              </View>
            </View>

            {/* Verified & Featured */}

            <View style={styles.infoRow}>
              {item.isVerified && (
                <View
                  style={[
                    styles.smallBadge,
                    { backgroundColor: "#4CAF50" },
                  ]}
                >
                  <Text style={styles.smallBadgeText}>
                    VERIFIED
                  </Text>
                </View>
              )}

              {item.isFeatured && (
                <View
                  style={[
                    styles.smallBadge,
                    { backgroundColor: "#9C27B0" },
                  ]}
                >
                  <Text style={styles.smallBadgeText}>
                    FEATURED
                  </Text>
                </View>
              )}
            </View>

            {/* Buttons */}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.editButton,
                ]}
                onPress={() => router.push(`/(tabs)/entrepreneur/student/business/${item._id}` as any)}
              >
                <Text style={styles.actionText}>
                  Edit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.deleteButton,
                ]}
                onPress={() =>
                  deleteBusiness(item._id)
                }
              >
                <Text style={styles.actionText}>
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
         onPress={() => router.push(`/(tabs)/entrepreneur/student/business/create` as any)}
      >
        <Text style={styles.fabText}>
          +
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default BusinessListScreen;

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
    color: "#999",
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
    alignItems: "flex-start",
    marginBottom: 12,
  },

  businessName: {
    fontSize: 21,
    fontWeight: "700",
    color: "#222",
    marginBottom: 5,
  },

  category: {
    fontSize: 14,
    color: "#0A84FF",
    fontWeight: "600",
    textTransform: "capitalize",
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },

  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },

  value: {
    fontSize: 14,
    color: "#222",
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
    marginLeft: 10,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 15,
  },

  statBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8F9FB",
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 10,
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0A84FF",
  },

  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#777",
  },

  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },

  smallBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },

  smallBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 5,
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