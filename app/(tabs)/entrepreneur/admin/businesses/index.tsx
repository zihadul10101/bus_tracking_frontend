import { businessService } from "@/src/services/entrepreneur";
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


interface Business {
  _id: string;
  name: string;
  category: string;
  description: string;

  status: "pending" | "approved" | "rejected" | "suspended";

  isVerified: boolean;
  isFeatured: boolean;

  totalViews: number;
  totalContactClicks: number;

  averageRating: number;
  totalRatings: number;

  owner: {
    _id: string;
    name: string;
    email: string;
    mobileNumber: string;
    departmentName: string;
  };
}

const AdminBusinessesScreen = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");


const getBusinesses = async () => {
  try {
    if (!refreshing) {
      setLoading(true);
    }

    const res = await businessService.adminGetAll(
      statusFilter === "all"
        ? undefined
        : { status: statusFilter }
    );

    if (res.success) {
      setBusinesses(res.data);
    }
  } catch (error: any) {
    console.log(error);

    Alert.alert(
      "Error",
      error.userMessage ||
        error.response?.data?.message ||
        "Failed to load businesses."
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

const updateBusinessStatus = async (
  id: string,
  body: {
    status?: "approved" | "rejected" | "suspended";
    rejectionReason?: string;
    isVerified?: boolean;
    isFeatured?: boolean;
  }
) => {
  try {
    const res = await businessService.adminUpdateStatus(id, body);

    if (res.success) {
      getBusinesses();
    }
  } catch (error: any) {
    Alert.alert(
      "Error",
      error.userMessage ||
        error.response?.data?.message ||
        "Failed to update business."
    );
  }
};

  const approveBusiness = (id: string) => {
    updateBusinessStatus(id, {
      status: "approved",
      isVerified: true,
    });
  };

  const rejectBusiness = (id: string) => {
    Alert.prompt?.(
      "Reject Business",
      "Enter rejection reason",
      async (reason) => {
        await updateBusinessStatus(id, {
          status: "rejected",
          rejectionReason: reason || "Rejected by admin",
        });
      }
    );
  };

  const suspendBusiness = (id: string) => {
    updateBusinessStatus(id, {
      status: "suspended",
    });
  };

  const toggleFeatured = (
    id: string,
    featured: boolean
  ) => {
    updateBusinessStatus(id, {
      isFeatured: !featured,
    });
  };

  useEffect(() => {
    getBusinesses();
  }, [statusFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getBusinesses();
  }, [statusFilter]);

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
      {/* Status Filter */}

      <View style={styles.filterRow}>
        {["all", "pending", "approved", "rejected", "suspended"].map(
          (item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterButton,
                statusFilter === item && styles.activeFilter,
              ]}
              onPress={() => setStatusFilter(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  statusFilter === item && styles.activeFilterText,
                ]}
              >
                {item.toUpperCase()}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <FlatList
        data={businesses}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListHeaderComponent={() => (
          <Text style={styles.header}>
            Business Management
          </Text>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No Business Found
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Business Header */}

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

            {/* Owner */}

            <Text style={styles.sectionTitle}>
              Owner Information
            </Text>

            <View style={styles.row}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>
                {item.owner?.name}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>
                {item.owner?.email}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Mobile</Text>
              <Text style={styles.value}>
                {item.owner?.mobileNumber}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                Department
              </Text>
              <Text style={styles.value}>
                {item.owner?.departmentName}
              </Text>
            </View>

            {/* Analytics */}

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
                  {item.totalContactClicks}
                </Text>

                <Text style={styles.statLabel}>
                  Contacts
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
            </View>

            {/* Badges */}

            <View style={styles.badgeRow}>
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

            {/* Action Buttons */}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: "#4CAF50" },
                ]}
                onPress={() =>
                  approveBusiness(item._id)
                }
              >
                <Text style={styles.actionText}>
                  Approve
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: "#F44336" },
                ]}
                onPress={() =>
                  rejectBusiness(item._id)
                }
              >
                <Text style={styles.actionText}>
                  Reject
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: "#FF9800" },
                ]}
                onPress={() =>
                  suspendBusiness(item._id)
                }
              >
                <Text style={styles.actionText}>
                  Suspend
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: item.isFeatured
                      ? "#9C27B0"
                      : "#0A84FF",
                  },
                ]}
                onPress={() =>
                  toggleFeatured(
                    item._id,
                    item.isFeatured
                  )
                }
              >
                <Text style={styles.actionText}>
                  {item.isFeatured
                    ? "Unfeature"
                    : "Feature"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default AdminBusinessesScreen;

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

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingTop: 15,
    paddingBottom: 8,
  },

  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },

  activeFilter: {
    backgroundColor: "#0A84FF",
  },

  filterText: {
    color: "#444",
    fontWeight: "600",
    fontSize: 13,
  },

  activeFilterText: {
    color: "#FFF",
  },

  emptyContainer: {
    marginTop: 100,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 17,
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
    alignItems: "flex-start",
    marginBottom: 12,
  },

  businessName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  category: {
    marginTop: 3,
    color: "#0A84FF",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 12,
  },

  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
    marginTop: 5,
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
    flex: 1,
    textAlign: "right",
    color: "#222",
    fontWeight: "700",
    fontSize: 14,
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
    backgroundColor: "#F8F9FB",
    borderRadius: 10,
    marginHorizontal: 4,
    paddingVertical: 12,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0A84FF",
  },

  statLabel: {
    marginTop: 4,
    color: "#777",
    fontSize: 12,
    fontWeight: "600",
  },

  badgeRow: {
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
    marginTop: 8,
  },

  actionButton: {
    flex: 1,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },

  actionText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
});