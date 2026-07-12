import { packageService } from "@/src/services/entrepreneur";
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


  "http://192.168.0.195:5000/api/v1/entrepreneur/packages";

const CreatePackageScreen = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [maxAdsPerStudent, setMaxAdsPerStudent] = useState("1");

  const [isFree, setIsFree] = useState(false);

  const [feature, setFeature] = useState("");
  const [features, setFeatures] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const addFeature = () => {
    if (!feature.trim()) return;

    setFeatures([...features, feature.trim()]);
    setFeature("");
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const clearForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setDurationDays("");
    setMaxAdsPerStudent("1");
    setIsFree(false);
    setFeature("");
    setFeatures([]);
  };

const createPackage = async () => {
  if (!name.trim()) {
    Alert.alert("Validation", "Package name is required.");
    return;
  }

  if (!isFree && !price) {
    Alert.alert("Validation", "Price is required.");
    return;
  }

  if (!durationDays) {
    Alert.alert("Validation", "Duration is required.");
    return;
  }

  try {
    setLoading(true);

    const response = await packageService.create({
      name,
      description,
      durationDays: Number(durationDays) as 7 | 15 | 30,
      price: isFree ? 0 : Number(price),
      isFree,
      features,
      maxAdsPerStudent: Number(maxAdsPerStudent),
    });

    console.log("Response:", response);

    Alert.alert("Success", "Package created successfully.");

    clearForm();
  } catch (error: any) {
    console.log("Create Package Error:", error);

    Alert.alert(
      "Error",
      error.userMessage || "Failed to create package."
    );
  } finally {
    setLoading(false);
  }
};
  //   if (!name.trim()) {
  //     Alert.alert("Validation", "Package name is required.");
  //     return;
  //   }

  //   if (!price) {
  //     Alert.alert("Validation", "Price is required.");
  //     return;
  //   }

  //   if (!durationDays) {
  //     Alert.alert("Validation", "Duration is required.");
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     const token = await AsyncStorage.getItem("userToken");

  //     if (!token) {
  //       Alert.alert("Error", "Login token not found.");
  //       return;
  //     }

  //     const response = await axios.post(
  //       API_URL,
  //       {
  //         name,
  //         description,
  //         durationDays: Number(durationDays),
  //         price: Number(price),
  //         isFree,
  //         features,
  //         maxAdsPerStudent: Number(maxAdsPerStudent),
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     console.log("Response:", response.data);

  //     Alert.alert("Success", "Package Created Successfully");

  //     clearForm();
  //   } catch (error: any) {
  //     console.log("Error:", error.response?.data || error.message);

  //     Alert.alert(
  //       "Error",
  //       error.response?.data?.message || "Something went wrong"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Create Package</Text>

      <Text style={styles.label}>Package Name</Text>

      <TextInput
        style={styles.input}
        placeholder="Basic Plan"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Description</Text>

      <TextInput
        style={[styles.input, styles.descriptionInput]}
        multiline
        placeholder="Package Description"
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
  style={[
    styles.input,
    isFree && {
      backgroundColor: "#F3F4F6",
      color: "#999",
    },
  ]}
  editable={!isFree}
  keyboardType="numeric"
  placeholder="500"
  value={isFree ? "0" : price}
  onChangeText={setPrice}
/>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Free Package</Text>

       <Switch
  value={isFree}
  onValueChange={(value) => {
    setIsFree(value);

    if (value) {
      setPrice("0");
    } else {
      setPrice("");
    }
  }}
/>
      </View>

      <Text style={styles.label}>Features</Text>

      <View style={styles.featureInputContainer}>
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
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
            {features.length > 0 &&
        features.map((item, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.featureText}>{item}</Text>

            <TouchableOpacity
              onPress={() => removeFeature(index)}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={createPackage}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Package</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreatePackageScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 25,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 15,
    backgroundColor: "#fff",
    marginBottom: 15,
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
    marginVertical: 15,
  },

  featureInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  addButton: {
    backgroundColor: "#0A84FF",
    height: 50,
    paddingHorizontal: 20,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  featureItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  featureText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },

  removeButton: {
    backgroundColor: "#E53935",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  removeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  button: {
    marginTop: 25,
    backgroundColor: "#0A84FF",
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
});