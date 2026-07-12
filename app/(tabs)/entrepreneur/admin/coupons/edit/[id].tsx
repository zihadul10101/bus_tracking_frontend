import { couponService } from "@/src/services/entrepreneur";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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



const EditCouponScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState("");
  const [appliesTo, setAppliesTo] = useState<
    "new" | "renewal" | "both"
  >("both");
  const [discountType, setDiscountType] = useState<
    "percentage" | "fixed"
  >("percentage");

  const [discountValue, setDiscountValue] = useState("");

  const [minOrderAmount, setMinOrderAmount] = useState("");

  const [maxDiscount, setMaxDiscount] = useState("");

  const [usageLimit, setUsageLimit] = useState("");

  const [expiresAt, setExpiresAt] = useState("");

  const [isActive, setIsActive] = useState(true);

  const getCoupon = async () => {
    try {
      setLoading(true);

      const res = await couponService.adminGetById(id!);

      const coupon = res.data;

      setCode(coupon.code);
      setDiscountType(coupon.discountType);
      setDiscountValue(String(coupon.discountValue));
      setMaxDiscount(
        coupon.maxDiscount != null
          ? String(coupon.maxDiscount)
          : ""
      );

      setMinOrderAmount(
        coupon.minOrderAmount != null
          ? String(coupon.minOrderAmount)
          : ""
      );

      setUsageLimit(
        coupon.usageLimit != null
          ? String(coupon.usageLimit)
          : ""
      );

      setAppliesTo(coupon.appliesTo || "both");

      if (coupon.expiresAt) {
        setExpiresAt(coupon.expiresAt.substring(0, 10));
      }

      setIsActive(coupon.isActive);
    } catch (error: any) {
      console.log(error);

      Alert.alert(
        "Error",
        error.userMessage ||
        error.message ||
        "Failed to load coupon."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getCoupon();
    }
  }, [id]);

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
  const updateCoupon = async () => {
    
    if (!discountValue.trim()) {
      Alert.alert(
        "Validation",
        "Discount value is required."
      );
      return;
    }

    try {
      setSaving(true);

   await couponService.update(id!, {
  code: code.trim().toUpperCase(),
  discountType,
  discountValue: Number(discountValue),
  maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
  minOrderAmount:
    minOrderAmount !== ""
      ? Number(minOrderAmount)
      : undefined,
  usageLimit:
    usageLimit !== ""
      ? Number(usageLimit)
      : undefined,
  expiresAt: expiresAt || undefined,
  isActive,
  appliesTo,
});

      Alert.alert(
        "Success",
        "Coupon updated successfully."
      );
    } catch (error: any) {
      console.log(error);

      Alert.alert(
        "Error",
        error.userMessage ||
        error.message ||
        "Failed to update coupon."
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Edit Coupon</Text>

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
          onPress={() =>
            setDiscountType("fixed")
          }
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

      <Text style={styles.label}>
        Discount Value
      </Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="20"
        value={discountValue}
        onChangeText={setDiscountValue}
      />

      <Text style={styles.label}>
        Minimum Purchase
      </Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="500"
        value={minOrderAmount}
        onChangeText={setMinOrderAmount}
      />

      <Text style={styles.label}>
        Maximum Discount
      </Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="100"
        value={maxDiscount}
        onChangeText={setMaxDiscount}
      />

      <Text style={styles.label}>
        Usage Limit
      </Text>

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
        {(["new", "renewal", "both"] as const).map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.typeButton,
              appliesTo === item && styles.selectedType,
            ]}
            onPress={() => setAppliesTo(item)}
          >
            <Text
              style={[
                styles.typeText,
                appliesTo === item &&
                styles.selectedTypeText,
              ]}
            >
              {item.toUpperCase()}
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
          saving && { opacity: 0.7 },
        ]}
        disabled={saving}
        onPress={updateCoupon}
      >
        {saving ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>
            Update Coupon
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditCouponScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
    paddingBottom: 40,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
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
    marginBottom: 25,
    marginTop: 5,
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
    marginTop: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,

    elevation: 3,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },
});