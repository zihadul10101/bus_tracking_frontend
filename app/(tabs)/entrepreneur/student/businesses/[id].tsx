import { businessService } from "@/src/services/entrepreneur";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const BASE = 375;

export default function BusinessProfileScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = (n: number) => Math.min((width / BASE) * n, n * 1.4);
  const { id } = useLocalSearchParams<{ id: string }>();

  const [business, setBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);

  const [showRateModal, setShowRateModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchBusiness = async (isRefresh = false) => {
    if (!id) return;
    try {
      isRefresh ? setIsRefetching(true) : setIsLoading(true);
      const data = await businessService.getById(id);
      if (data.success) {
        setBusiness(data.data);
      } else {
        console.error("fetchBusiness failed:", data.message);
      }
    } catch (err) {
      console.error("fetchBusiness error:", err);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    fetchBusiness();
  }, [id]);

  const trackContactClick = async () => {
    try {
      await businessService.trackClick(id);
    } catch (err) {
      console.error("trackContactClick error:", err);
    }
  };

  const handleCall = () => {
    const phone = business?.contact?.phone;
    if (!phone) return;
    trackContactClick();
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = () => {
    const wa = business?.contact?.whatsapp;
    if (!wa) return;
    trackContactClick();
    Linking.openURL(`https://wa.me/${wa}`);
  };

  const handleLink = (url: string) => {
    trackContactClick();
    Linking.openURL(url);
  };

  const handleSubmitRating = async () => {
    if (ratingValue === 0) {
      Alert.alert("Select a rating", "Please tap a star to rate.");
      return;
    }
    setSubmittingRating(true);
    try {
      const data = await businessService.addRating(id, ratingValue, reviewText);
      if (data.success) {
        setShowRateModal(false);
        setRatingValue(0);
        setReviewText("");
        fetchBusiness(true);
      } else {
        Alert.alert("Error", data.message || "Failed to submit rating.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to submit rating.");
    } finally {
      setSubmittingRating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2D60FF" />
        </View>
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#E53935" />
          <Text style={styles.emptyText}>Business not found</Text>
        </View>
      </View>
    );
  }

  const hasSocial =
    business.socialLinks && Object.values(business.socialLinks).some(Boolean);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => fetchBusiness(true)}
            colors={["#2D60FF"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coverWrap}>
          {business.coverImage?.url ? (
            <Image source={{ uri: business.coverImage.url }} style={styles.coverImg} />
          ) : (
            <View style={[styles.coverImg, styles.coverPlaceholder]}>
              <Ionicons name="image-outline" size={40} color="#ccc" />
            </View>
          )}

          <View style={[styles.logoWrap, { borderRadius: s(20) }]}>
            {business.logo?.url ? (
              <Image source={{ uri: business.logo.url }} style={styles.logoImg} />
            ) : (
              <View style={[styles.logoImg, styles.logoPlaceholder]}>
                <Ionicons name="storefront" size={s(28)} color="#2D60FF" />
              </View>
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: s(36) }}>
          <View style={styles.nameRow}>
            <Text style={[styles.bizName, { fontSize: s(20) }]}>{business.name}</Text>
            {business.isVerified && (
              <Ionicons name="checkmark-circle" size={s(18)} color="#2D60FF" />
            )}
          </View>
          <View style={[styles.catBadge, { alignSelf: "flex-start" }]}>
            <Text style={[styles.catText, { fontSize: s(11) }]}>{business.category}</Text>
          </View>

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons
                key={i}
                name={i <= Math.round(business.averageRating) ? "star" : "star-outline"}
                size={s(16)}
                color="#FFB800"
              />
            ))}
            <Text style={[styles.ratingVal, { fontSize: s(13) }]}>
              {business.averageRating > 0
                ? business.averageRating.toFixed(1)
                : "No ratings"}
            </Text>
            {business.totalRatings > 0 && (
              <Text style={[styles.ratingCount, { fontSize: s(12) }]}>
                ({business.totalRatings})
              </Text>
            )}
            <TouchableOpacity
              style={[styles.rateBtn, { borderRadius: s(20) }]}
              onPress={() => setShowRateModal(true)}
            >
              <Ionicons name="star-outline" size={s(13)} color="#2D60FF" />
              <Text style={[styles.rateBtnText, { fontSize: s(12) }]}>Rate</Text>
            </TouchableOpacity>
          </View>

          {business.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: s(14) }]}>About</Text>
              <Text style={[styles.description, { fontSize: s(13) }]}>
                {business.description}
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: s(14) }]}>Contact</Text>
            <View style={styles.contactRow}>
              {business.contact?.phone && (
                <TouchableOpacity
                  style={[styles.contactBtn, { backgroundColor: "#E8F5E9", borderRadius: s(12), flex: 1 }]}
                  onPress={handleCall}
                >
                  <Ionicons name="call" size={s(18)} color="#4CAF50" />
                  <Text style={[styles.contactBtnText, { color: "#4CAF50", fontSize: s(12) }]}>
                    Call
                  </Text>
                </TouchableOpacity>
              )}
              {business.contact?.whatsapp && (
                <TouchableOpacity
                  style={[styles.contactBtn, { backgroundColor: "#E8F5E9", borderRadius: s(12), flex: 1 }]}
                  onPress={handleWhatsApp}
                >
                  <Ionicons name="logo-whatsapp" size={s(18)} color="#25D366" />
                  <Text style={[styles.contactBtnText, { color: "#25D366", fontSize: s(12) }]}>
                    WhatsApp
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {business.contact?.email && (
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={s(14)} color="#aaa" />
                <Text style={[styles.infoText, { fontSize: s(13) }]}>
                  {business.contact.email}
                </Text>
              </View>
            )}
            {business.contact?.address && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={s(14)} color="#aaa" />
                <Text style={[styles.infoText, { fontSize: s(13) }]}>
                  {business.contact.address}
                </Text>
              </View>
            )}
          </View>

          {(business.location?.city || business.location?.area) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: s(14) }]}>Location</Text>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={s(16)} color="#E53935" />
                <Text style={[styles.infoText, { fontSize: s(13) }]}>
                  {[business.location.area, business.location.city].filter(Boolean).join(", ")}
                </Text>
              </View>
            </View>
          )}

          {hasSocial && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: s(14) }]}>Follow</Text>
              <View style={styles.socialRow}>
                {business.socialLinks?.facebook && (
                  <TouchableOpacity
                    style={[styles.socialBtn, { backgroundColor: "#1877F215", borderRadius: s(10) }]}
                    onPress={() => handleLink(business.socialLinks.facebook)}
                  >
                    <Ionicons name="logo-facebook" size={s(18)} color="#1877F2" />
                    <Text style={[styles.socialLabel, { color: "#1877F2", fontSize: s(11) }]}>
                      Facebook
                    </Text>
                  </TouchableOpacity>
                )}
                {business.socialLinks?.instagram && (
                  <TouchableOpacity
                    style={[styles.socialBtn, { backgroundColor: "#E1306C15", borderRadius: s(10) }]}
                    onPress={() => handleLink(business.socialLinks.instagram)}
                  >
                    <Ionicons name="logo-instagram" size={s(18)} color="#E1306C" />
                    <Text style={[styles.socialLabel, { color: "#E1306C", fontSize: s(11) }]}>
                      Instagram
                    </Text>
                  </TouchableOpacity>
                )}
                {business.socialLinks?.website && (
                  <TouchableOpacity
                    style={[styles.socialBtn, { backgroundColor: "#2D60FF15", borderRadius: s(10) }]}
                    onPress={() => handleLink(business.socialLinks.website)}
                  >
                    <Ionicons name="globe-outline" size={s(18)} color="#2D60FF" />
                    <Text style={[styles.socialLabel, { color: "#2D60FF", fontSize: s(11) }]}>
                      Website
                    </Text>
                  </TouchableOpacity>
                )}
                {business.socialLinks?.youtube && (
                  <TouchableOpacity
                    style={[styles.socialBtn, { backgroundColor: "#FF000015", borderRadius: s(10) }]}
                    onPress={() => handleLink(business.socialLinks.youtube)}
                  >
                    <Ionicons name="logo-youtube" size={s(18)} color="#FF0000" />
                    <Text style={[styles.socialLabel, { color: "#FF0000", fontSize: s(11) }]}>
                      YouTube
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.reviewHeader}>
              <Text style={[styles.sectionTitle, { fontSize: s(14) }]}>
                Reviews ({business.ratings?.length ?? 0})
              </Text>
            </View>
            {!business.ratings || business.ratings.length === 0 ? (
              <Text style={[styles.noReviews, { fontSize: s(13) }]}>
                No reviews yet. Be the first!
              </Text>
            ) : (
              business.ratings
                .slice()
                .reverse()
                .map((r: any, idx: number) => (
                  <View key={idx} style={styles.reviewCard}>
                    <View style={styles.reviewTop}>
                      <View style={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Ionicons
                            key={i}
                            name={i <= r.rating ? "star" : "star-outline"}
                            size={s(12)}
                            color="#FFB800"
                          />
                        ))}
                      </View>
                      <Text style={[styles.reviewDate, { fontSize: s(10) }]}>
                        {new Date(r.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </Text>
                    </View>
                    {r.review ? (
                      <Text style={[styles.reviewText, { fontSize: s(12) }]}>{r.review}</Text>
                    ) : null}
                  </View>
                ))
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showRateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { borderRadius: s(16) }]}>
            <Text style={[styles.modalTitle, { fontSize: s(16) }]}>Rate {business.name}</Text>

            <View style={styles.starPicker}>
              {[1, 2, 3, 4, 5].map((i) => (
                <TouchableOpacity key={i} onPress={() => setRatingValue(i)}>
                  <Ionicons
                    name={i <= ratingValue ? "star" : "star-outline"}
                    size={s(34)}
                    color="#FFB800"
                    style={{ marginHorizontal: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.reviewInput, { fontSize: s(13), borderRadius: s(10) }]}
              placeholder="Write a review (optional)..."
              value={reviewText}
              onChangeText={setReviewText}
              placeholderTextColor="#aaa"
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#F3F4F6", flex: 1 }]}
                onPress={() => {
                  setShowRateModal(false);
                  setRatingValue(0);
                  setReviewText("");
                }}
              >
                <Text style={[styles.modalBtnText, { color: "#555" }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#2D60FF", flex: 1 }]}
                onPress={handleSubmitRating}
                disabled={submittingRating}
              >
                {submittingRating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: "#fff" }]}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F5F7" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  emptyText: { color: "#aaa", fontSize: 14 },
  coverWrap: { position: "relative" },
  coverImg: { width: "100%", height: 160, backgroundColor: "#eee" },
  coverPlaceholder: { alignItems: "center", justifyContent: "center" },
  logoWrap: {
    position: "absolute",
    bottom: -32,
    left: 16,
    width: 80,
    height: 80,
    backgroundColor: "#fff",
    padding: 4,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.15, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6 },
      android: { elevation: 4 },
    }),
  },
  logoImg: { width: "100%", height: "100%", borderRadius: 16 },
  logoPlaceholder: { backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  bizName: { fontWeight: "800", color: "#1A1A2E" },
  catBadge: { backgroundColor: "#EEF2FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 10 },
  catText: { color: "#2D60FF", fontWeight: "600", textTransform: "capitalize" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 16 },
  ratingVal: { fontWeight: "700", color: "#1A1A2E", marginLeft: 6 },
  ratingCount: { color: "#aaa" },
  rateBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#EEF2FF", paddingHorizontal: 10, paddingVertical: 5, marginLeft: "auto" },
  rateBtnText: { color: "#2D60FF", fontWeight: "700" },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5 },
      android: { elevation: 1 },
    }),
  },
  sectionTitle: { fontWeight: "700", color: "#1A1A2E", marginBottom: 10 },
  description: { color: "#666", lineHeight: 20 },
  contactRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  contactBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12 },
  contactBtnText: { fontWeight: "700" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  infoText: { color: "#444", flex: 1 },
  socialRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  socialBtn: { alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, gap: 4, minWidth: 76 },
  socialLabel: { fontWeight: "600" },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  noReviews: { color: "#aaa", textAlign: "center", paddingVertical: 12 },
  reviewCard: { borderTopWidth: 0.5, borderTopColor: "#eee", paddingVertical: 10 },
  reviewTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  reviewStars: { flexDirection: "row", gap: 1 },
  reviewDate: { color: "#aaa" },
  reviewText: { color: "#555", lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalBox: { backgroundColor: "#fff", padding: 20, width: "100%" },
  modalTitle: { fontWeight: "700", color: "#1A1A2E", textAlign: "center", marginBottom: 16 },
  starPicker: { flexDirection: "row", justifyContent: "center", marginBottom: 16 },
  reviewInput: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#333",
    minHeight: 70,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  modalActions: { flexDirection: "row", gap: 10 },
  modalBtn: { paddingVertical: 12, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  modalBtnText: { fontWeight: "700" },
});