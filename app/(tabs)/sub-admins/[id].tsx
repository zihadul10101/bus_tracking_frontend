import SubAdminForm from "@/src/components/SubAdminForm";
import {
  SubAdmin,
  subAdminService,
} from "@/src/services/subAdminService";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import React, {
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ✅ subAdminService-এর Permissions টাইপের সব field optional,
// কিন্তু SubAdminForm-এর জন্য সবগুলো required — তাই default দিয়ে normalize করা হচ্ছে
const DEFAULT_PERMISSIONS = {
  canManageBuses: false,
  canManageStudents: false,
  canPostNotices: false,
  canViewTracking: false,
};

export default function EditSubAdmin() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [admin, setAdmin] =
    useState<SubAdmin | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const getSubAdmin = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const res =
        await subAdminService.getById(id);

      setAdmin(res.data);
    } catch (error: any) {
      console.log("Get Sub Admin:", error);

      Alert.alert(
        "Error",
        error.userMessage ||
          error.message ||
          "Failed to load sub-admin."
      );

      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSubAdmin();
  }, [id]);

  const handleUpdate = async (
    values: any
  ) => {
    if (!id) return;

    try {
      setSaving(true);

      await subAdminService.update(id, values);

      Alert.alert(
        "Success",
        "Sub Admin updated successfully.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.log(
        "Update Sub Admin:",
        error
      );

      Alert.alert(
        "Error",
        error.userMessage ||
          error.message ||
          "Failed to update sub-admin."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#2563eb"
        />

        <Text style={styles.loadingText}>
          Loading Profile...
        </Text>
      </View>
    );
  }

  if (!admin) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Sub Admin not found.
        </Text>
      </View>
    );
  }

  // ✅ ফর্মে পাঠানোর আগে permissions normalize করা হচ্ছে
  // যাতে missing/undefined field-এর জন্য default false বসে
  const formInitialValues = {
    ...admin,
    permissions: {
      ...DEFAULT_PERMISSIONS,
      ...admin.permissions,
    },
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
      {saving && (
        <ActivityIndicator
          style={styles.loader}
          size="small"
          color="#2563eb"
        />
      )}

      <SubAdminForm
        initialValues={formInitialValues}
        onSubmit={handleUpdate}
        submitButtonText="Save Changes"
        isEditMode
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },

  loader: {
    marginVertical: 15,
  },

  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 15,
  },

  errorText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 16,
  },
});