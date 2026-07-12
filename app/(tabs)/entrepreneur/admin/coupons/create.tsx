import { couponService } from "@/src/services/entrepreneur";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";



const CreateCouponScreen = () => {
  const [code, setCode] = useState("");
  const [appliesTo, setAppliesTo] = useState<
    "new" | "renewal" | "both"
  >("both");
  const [discountType, setDiscountType] = useState<
    "percentage" | "fixed"
  >("percentage");

  const [discountValue, setDiscountValue] = useState("");

  const [maxDiscount, setMaxDiscount] = useState("");

  const [minOrderAmount, setMinOrderAmount] = useState("");

  const [usageLimit, setUsageLimit] = useState("");

  const [expiresAt, setExpiresAt] = useState("");

  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);

  const createCoupon = async () => {
    if (!code.trim()) {
      Alert.alert("Validation", "Coupon code is required.");
      return;
    }

    if (!discountValue) {
      Alert.alert("Validation", "Discount value is required.");
      return;
    }

    try {
      setLoading(true);

      const res = await couponService.create({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        maxDiscount:
          discountType === "percentage" && maxDiscount
            ? Number(maxDiscount)
            : undefined,
        minOrderAmount: minOrderAmount
          ? Number(minOrderAmount)
          : undefined,
        usageLimit: usageLimit
          ? Number(usageLimit)
          : undefined,
        expiresAt: expiresAt.trim() || undefined,
        isActive,
        appliesTo,
      });

      console.log("Coupon:", res);

      Alert.alert(
        "Success",
        "Coupon created successfully."
      );

      setCode("");
      setDiscountType("percentage");
      setDiscountValue("");
      setMaxDiscount("");
      setMinOrderAmount("");
      setUsageLimit("");
      setExpiresAt("");
      setIsActive(true);
      setAppliesTo("both");
    } catch (error: any) {
      console.log(error);

      Alert.alert(
        "Error",
        error.userMessage ||
        error.message ||
        "Failed to create coupon."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Create Coupon</Text>

      <Text style={styles.label}>Coupon Code</Text>

      <TextInput
        style={styles.input}
        placeholder="WELCOME50"
        autoCapitalize="characters"
        value={code}
        onChangeText={setCode}
      />

      <Text style={styles.label}>Discount Type</Text>

      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            discountType === "percentage" &&
            styles.selectedType,
          ]}
          onPress={() =>
            setDiscountType("percentage")
          }
        >
          <Text
            style={[
              styles.typeText,
              discountType === "percentage" &&
              styles.selectedTypeText,
            ]}
          >
            Percentage
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            discountType === "fixed" &&
            styles.selectedType,
          ]}
          onPress={() => setDiscountType("fixed")}
        >
          <Text
            style={[
              styles.typeText,
              discountType === "fixed" &&
              styles.selectedTypeText,
            ]}
          >
            Fixed
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Discount Value</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="20"
        value={discountValue}
        onChangeText={setDiscountValue}
      />

      {discountType === "percentage" && (
        <>
          <Text style={styles.label}>Maximum Discount</Text>

          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="100"
            value={maxDiscount}
            onChangeText={setMaxDiscount}
          />
        </>
      )}

      <Text style={styles.label}>Minimum Order Amount</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="500"
        value={minOrderAmount}
        onChangeText={setMinOrderAmount}
      />

      <Text style={styles.label}>Usage Limit</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="100"
        value={usageLimit}
        onChangeText={setUsageLimit}
      />

      <Text style={styles.label}>
        Expiry Date
      </Text>

      <TextInput
        style={styles.input}
        placeholder="2026-12-31"
        value={expiresAt}
        onChangeText={setExpiresAt}
      />
      <Text style={styles.label}>Applies To</Text>

      <View style={styles.typeRow}>
        {[
          { value: "new", label: "New" },
          { value: "renewal", label: "Renewal" },
          { value: "both", label: "Both" },
        ].map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.typeButton,
              appliesTo === item.value && styles.selectedType,
            ]}
            onPress={() => setAppliesTo(item.value as any)}
          >
            <Text
              style={[
                styles.typeText,
                appliesTo === item.value && styles.selectedTypeText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>
          Active Coupon
        </Text>

        <Switch
          value={isActive}
          onValueChange={setIsActive}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          loading && { opacity: 0.7 },
        ]}
        disabled={loading}
        onPress={createCoupon}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>
            Create Coupon
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateCouponScreen;
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    marginBottom: 25,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    fontSize: 15,
    marginBottom: 18,
  },

  typeRow: {
    flexDirection: "row",
    marginBottom: 20,
  },

  typeButton: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0A84FF",
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: "#FFF",
  },

  selectedType: {
    backgroundColor: "#0A84FF",
  },

  typeText: {
    color: "#0A84FF",
    fontWeight: "700",
    fontSize: 15,
  },

  selectedTypeText: {
    color: "#FFF",
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 25,
  },

  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },

  button: {
    height: 55,
    backgroundColor: "#0A84FF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },
});