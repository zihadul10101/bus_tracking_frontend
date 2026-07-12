import { packageService } from "@/src/services/entrepreneur";
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

const API_URL ="http://192.168.0.195:5000/api/v1/entrepreneur/packages";

const EditPackageScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [durationDays, setDurationDays] = useState("");
    const [maxAdsPerStudent, setMaxAdsPerStudent] = useState("1");

    const [isFree, setIsFree] = useState(false);

    const [feature, setFeature] = useState("");
    const [features, setFeatures] = useState<string[]>([]);

const getPackage = async () => {
  try {
    setLoading(true);

    const response = await packageService.getById(id);

    if (!response.success) {
      Alert.alert("Error", response.message || "Failed to load package.");
      return;
    }

    const pkg = response.data;

    setName(pkg.name ?? "");
    setDescription(pkg.description ?? "");
    setPrice(String(pkg.price ?? ""));
    setDurationDays(String(pkg.durationDays ?? ""));
    setMaxAdsPerStudent(String(pkg.maxAdsPerStudent ?? 1));
    setIsFree(pkg.isFree ?? false);
    setFeatures(pkg.features ?? []);
  } catch (error: any) {
    console.log(error);

    Alert.alert(
      "Error",
      error.userMessage || "Failed to load package."
    );
  } finally {
    setLoading(false);
  }
};

    useEffect(() => {
        if (id) {
            getPackage();
        }
    }, [id]);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#0A84FF" />
            </View>
        );
    }

    const addFeature = () => {
        if (!feature.trim()) return;

        setFeatures([...features, feature.trim()]);
        setFeature("");
    };

    const removeFeature = (index: number) => {
        setFeatures(features.filter((_, i) => i !== index));
    };

 const updatePackage = async () => {
  if (!name.trim()) {
    Alert.alert("Validation", "Package name is required.");
    return;
  }

  if (!price) {
    Alert.alert("Validation", "Price is required.");
    return;
  }

  if (!durationDays) {
    Alert.alert("Validation", "Duration is required.");
    return;
  }

  try {
    setSaving(true);

    const response = await packageService.update(id, {
      name,
      description,
      durationDays: Number(durationDays),
      price: Number(price),
      isFree,
      features,
      maxAdsPerStudent: Number(maxAdsPerStudent),
    });

    if (response.success) {
      Alert.alert("Success", "Package updated successfully.");
    }
  } catch (error: any) {
    console.log(error);

    Alert.alert(
      "Error",
      error.userMessage || "Failed to update package."
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
            <Text style={styles.title}>Edit Package</Text>

            <Text style={styles.label}>Package Name</Text>

            <TextInput
                style={styles.input}
                placeholder="Package Name"
                value={name}
                onChangeText={setName}
            />

            <Text style={styles.label}>Description</Text>

            <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Package Description"
                multiline
                value={description}
                onChangeText={setDescription}
            />

            <Text style={styles.label}>Price</Text>

            <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="500"
                value={price}
                onChangeText={setPrice}
            />

            <Text style={styles.label}>Duration (Days)</Text>

            <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="30"
                value={durationDays}
                onChangeText={setDurationDays}
            />

            <Text style={styles.label}>Max Ads Per Student</Text>

            <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="1"
                value={maxAdsPerStudent}
                onChangeText={setMaxAdsPerStudent}
            />

            <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Free Package</Text>

                <Switch
                    value={isFree}
                    onValueChange={setIsFree}
                />
            </View>

            <Text style={styles.label}>Features</Text>

            <View style={styles.featureInputRow}>
                <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Enter Feature"
                    value={feature}
                    onChangeText={setFeature}
                />

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={addFeature}
                >
                    <Text style={styles.addButtonText}>
                        Add
                    </Text>
                </TouchableOpacity>
            </View>

            {features.length === 0 ? (
                <Text style={styles.noFeature}>
                    No Features Added
                </Text>
            ) : (
                features.map((item, index) => (
                    <View
                        key={index}
                        style={styles.featureItem}
                    >
                        <Text style={styles.featureText}>
                            • {item}
                        </Text>

                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() =>
                                removeFeature(index)
                            }
                        >
                            <Text
                                style={styles.removeButtonText}
                            >
                                Remove
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))
            )}

            <TouchableOpacity
                style={[
                    styles.saveButton,
                    saving && { opacity: 0.7 },
                ]}
                disabled={saving}
                onPress={updatePackage}
            >
                {saving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveButtonText}>
                        Update Package
                    </Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );

};

export default EditPackageScreen;
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
        backgroundColor: "#fff",
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
        paddingHorizontal: 15,
        backgroundColor: "#FFF",
        fontSize: 15,
        marginBottom: 16,
    },

    descriptionInput: {
        height: 110,
        textAlignVertical: "top",
        paddingTop: 12,
    },

    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },

    switchLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },

    featureInputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },

    addButton: {
        height: 50,
        paddingHorizontal: 20,
        marginLeft: 10,
        borderRadius: 10,
        backgroundColor: "#0A84FF",
        justifyContent: "center",
        alignItems: "center",
    },

    addButtonText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 15,
    },

    noFeature: {
        color: "#888",
        fontStyle: "italic",
        marginBottom: 20,
    },

    featureItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,

        elevation: 2,
    },

    featureText: {
        flex: 1,
        color: "#333",
        fontSize: 15,
    },

    removeButton: {
        backgroundColor: "#E53935",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 6,
    },

    removeButtonText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 13,
    },

    saveButton: {
        height: 55,
        backgroundColor: "#0A84FF",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 25,
        marginBottom: 30,
    },

    saveButtonText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 17,
    },
});