
import { businessService } from "@/src/services/entrepreneur";
import { BUSINESS_CATEGORIES } from "@/src/services/entrepreneur/businessCategories";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CreateBusinessScreen = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  // Contact
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");

  // Social Links
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");
  const [youtube, setYoutube] = useState("");

  // Location
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");

  const [loading, setLoading] = useState(false);

  const createBusiness = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Business name is required.");
      return;
    }
    if (!category.trim()) {
      Alert.alert("Validation", "Please select a category.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Validation", "Description is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await businessService.create({
        name,
        category,
        description,
        contact: {
          phone,
          email,
          whatsapp,
          address,
        },
        socialLinks: {
          facebook,
          instagram,
          twitter,
          website,
          youtube,
        },
        location: {
          city,
          area,
        },
      });

      console.log("Business Created:", response);

      Alert.alert("Success", "Business created successfully.");

      // Reset Form
      setName("");
      setCategory("");
      setDescription("");

      setPhone("");
      setEmail("");
      setWhatsapp("");
      setAddress("");

      setFacebook("");
      setInstagram("");
      setTwitter("");
      setWebsite("");
      setYoutube("");

      setCity("");
      setArea("");
    } catch (error: any) {
      console.log("Create Business Error:", error.response?.data || error.message);

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create business."
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
      <Text style={styles.title}>Create Business</Text>

      {/* Business Information */}
      <Text style={styles.sectionTitle}>Business Information</Text>

      <Text style={styles.label}>Business Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter business name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.catGrid}>
        {BUSINESS_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catOption, category === cat && styles.catOptionActive]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={[
                styles.catOptionText,
                { color: category === cat ? "#fff" : "#555" },
              ]}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.descriptionInput}
        placeholder="Write business description..."
        multiline
        value={description}
        onChangeText={setDescription}
      />

      {/* Contact */}
      <Text style={styles.sectionTitle}>Contact Information</Text>

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        placeholder="+8801XXXXXXXXX"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="business@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>WhatsApp</Text>
      <TextInput
        style={styles.input}
        placeholder="+8801XXXXXXXXX"
        keyboardType="phone-pad"
        value={whatsapp}
        onChangeText={setWhatsapp}
      />

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        placeholder="House, Road, Area"
        value={address}
        onChangeText={setAddress}
      />

      {/* Social Links */}
      <Text style={styles.sectionTitle}>Social Links</Text>

      <Text style={styles.label}>Facebook</Text>
      <TextInput
        style={styles.input}
        placeholder="https://facebook.com/..."
        autoCapitalize="none"
        value={facebook}
        onChangeText={setFacebook}
      />

      <Text style={styles.label}>Instagram</Text>
      <TextInput
        style={styles.input}
        placeholder="https://instagram.com/..."
        autoCapitalize="none"
        value={instagram}
        onChangeText={setInstagram}
      />

      <Text style={styles.label}>Twitter</Text>
      <TextInput
        style={styles.input}
        placeholder="https://twitter.com/..."
        autoCapitalize="none"
        value={twitter}
        onChangeText={setTwitter}
      />

      <Text style={styles.label}>Website</Text>
      <TextInput
        style={styles.input}
        placeholder="https://example.com"
        autoCapitalize="none"
        value={website}
        onChangeText={setWebsite}
      />

      <Text style={styles.label}>YouTube</Text>
      <TextInput
        style={styles.input}
        placeholder="https://youtube.com/..."
        autoCapitalize="none"
        value={youtube}
        onChangeText={setYoutube}
      />

      {/* Location */}
      <Text style={styles.sectionTitle}>Business Location</Text>

      <Text style={styles.label}>City</Text>
      <TextInput
        style={styles.input}
        placeholder="Rajshahi"
        value={city}
        onChangeText={setCity}
      />

      <Text style={styles.label}>Area</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Mirpur"
        value={area}
        onChangeText={setArea}
      />

      {/* Create Button */}
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        disabled={loading}
        onPress={createBusiness}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Create Business</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateBusinessScreen;

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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0A84FF",
    marginTop: 15,
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    marginBottom: 18,
  },
  descriptionInput: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingTop: 12,
    minHeight: 120,
    textAlignVertical: "top",
    fontSize: 15,
    marginBottom: 18,
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  catOption: {
    borderWidth: 1,
    borderColor: "#DDD",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#FFF",
  },
  catOptionActive: {
    backgroundColor: "#0A84FF",
    borderColor: "#0A84FF",
  },
  catOptionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  button: {
    height: 55,
    backgroundColor: "#0A84FF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },
});