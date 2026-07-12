import SubAdminForm from "@/src/components/SubAdminForm";
import { subAdminService } from "@/src/services/subAdminService";
import { router } from "expo-router";
import React from "react";
import { Alert, View } from "react-native";

export default function CreateSubAdmin() {
  const handleCreate = async (values: any) => {
    try {
      const submitData = {
        ...values,
        role: "sub_admin" as const,
      };

      await subAdminService.create(submitData);

      Alert.alert(
        "Success",
        "Sub Admin created successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.log("Create Sub Admin Error:", error);

      Alert.alert(
        "Error",
        error.userMessage ||
          error.response?.data?.message ||
          error.message ||
          "Could not create Sub Admin."
      );
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
      }}
    >
      <SubAdminForm
        onSubmit={handleCreate}
        submitButtonText="Create Sub Admin"
      />
    </View>
  );
}