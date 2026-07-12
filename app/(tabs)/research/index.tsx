import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList, RefreshControl } from "react-native-gesture-handler";

import { colors } from "@/constants/colors";
import DepartmentCard from "@/src/components/research/DepartmentCard";
import LatestCard from "@/src/components/research/LatestCard";
import ResearchCard from "@/src/components/research/ResearchCard";
import ResearchSearch from "@/src/components/research/ResearchSearch";
import SectionHeader from "@/src/components/research/SectionHeader";
import TopResearcherCard from "@/src/components/research/TopResearcherCard";
import ResearchService from "@/src/services/research.service";

import {
  DepartmentResearch,
  Research,
  TopResearcher,
} from "@/src/types/Research.service.types";

// ==========================================
// Tabs
// ==========================================

type ResearchTab = "publications" | "researchers" | "departments";

const TABS: { key: ResearchTab; label: string; icon: string }[] = [
  { key: "publications", label: "Publications", icon: "📑" },
  { key: "researchers", label: "Researchers", icon: "🏆" },
  { key: "departments", label: "Departments", icon: "🏫" },
];

export default function ResearchScreen() {
  // ==========================================
  // States
  // ==========================================

  const [papers, setPapers] = useState<Research[]>([]);
  const [latest, setLatest] = useState<Research[]>([]);
  const [topResearchers, setTopResearchers] = useState<TopResearcher[]>([]);
  const [departments, setDepartments] = useState<DepartmentResearch[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState<ResearchTab>("publications");

  // ==========================================
  // Fetch
  // ==========================================

  const fetchResearch = async (keyword = "") => {
    try {
      setLoading(true);

      const [allResponse, latestResponse, topResponse, departmentResponse] =
        await Promise.all([
          ResearchService.getAll({ search: keyword, page: 1, limit: 20 }),
          ResearchService.getLatest(),
          ResearchService.getTopResearchers(),
          ResearchService.getDepartmentWise(),
        ]);

      setPapers(allResponse.data || []);
      setLatest(latestResponse.data || []);
      setTopResearchers(topResponse.data || []);
      setDepartments(departmentResponse.data || []);
    } catch (error) {
      console.log("Research Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================
  // Initial Load
  // ==========================================

  useEffect(() => {
    fetchResearch();
  }, []);

  // ==========================================
  // Pull To Refresh
  // ==========================================

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchResearch(search);
  }, [search]);

  // ==========================================
  // Debounce Search
  // ==========================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Gathering research…</Text>
      </View>
    );
  }

  // ==========================
  // UI
  // ==========================

  return (
    <FlatList
      data={papers}
      keyExtractor={(item) => item._id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      ListHeaderComponent={
        <>
          <View style={styles.pageHeader}>
            <Text style={styles.eyebrow}>RESEARCH HUB</Text>
            <Text style={styles.pageTitle}>Explore the archive</Text>
          </View>

          <ResearchSearch
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch("")}
          />

          <View style={styles.tabContainer}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  activeOpacity={0.8}
                  style={[styles.tab, isActive && styles.activeTab]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Text style={styles.tabIcon}>{tab.icon}</Text>
                  <Text
                    style={[
                      styles.tabText,
                      isActive && styles.activeTabText,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {activeTab === "publications" && (
            <View style={styles.section}>
              <SectionHeader
                title="📑 Top Publications"
                subtitle="Latest approved research papers"
              />

              {latest.length > 0 ? (
                latest.map((item) => (
                  <LatestCard key={item._id} item={item} />
                ))
              ) : (
                <EmptyRow message="No publications found yet." />
              )}
            </View>
          )}

          {activeTab === "researchers" && (
            <View style={styles.section}>
              <SectionHeader
                title="🏆 Top Researchers"
                subtitle="Researchers with the most publications"
              />

              {topResearchers.length > 0 ? (
                topResearchers.map((item) => (
                  <TopResearcherCard key={item._id} item={item} />
                ))
              ) : (
                <EmptyRow message="No researchers found yet." />
              )}
            </View>
          )}

          {activeTab === "departments" && (
            <View style={styles.section}>
              <SectionHeader
                title="🏫 Top Departments"
                subtitle="Research grouped by department"
              />

              {departments.length > 0 ? (
                departments.map((item) => (
                  <DepartmentCard key={item.department} item={item} />
                ))
              ) : (
                <EmptyRow message="No departments found yet." />
              )}
            </View>
          )}

          <View style={styles.divider} />

          <SectionHeader
            title="📚 All Research Papers"
            subtitle={`${papers.length} approved publication${
              papers.length === 1 ? "" : "s"
            }`}
          />
        </>
      }
      renderItem={({ item }) => <ResearchCard item={item} />}
      ItemSeparatorComponent={() => <View style={styles.itemSpacer} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No research papers found</Text>
          <Text style={styles.emptySubtitle}>
            Try a different keyword or clear your search.
          </Text>
        </View>
      }
    />
  );
}

// ==========================================
// Small helper for empty tab sections
// ==========================================

function EmptyRow({ message }: { message: string }) {
  return (
    <View style={styles.noDataBox}>
      <Text style={styles.noData}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#F7F8FB",
    flexGrow: 1,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8FB",
    gap: 12,
  },

  loaderText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "500",
  },

  // ==========================
  // Page header
  // ==========================

  pageHeader: {
    marginTop: 8,
    marginBottom: 18,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: colors.primary,
    marginBottom: 4,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },

  // ==========================
  // Tabs
  // ==========================

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 5,
    marginTop: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#EEF1F6",

    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },

  activeTab: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  tabIcon: {
    fontSize: 13,
  },

  tabText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#64748B",
  },

  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // ==========================
  // Sections
  // ==========================

  section: {
    marginBottom: 8,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E9F0",
    marginVertical: 22,
  },

  itemSpacer: {
    height: 12,
  },

  // ==========================
  // Empty states
  // ==========================

  empty: {
    marginTop: 60,
    alignItems: "center",
    paddingHorizontal: 32,
  },

  emptyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },

  emptySubtitle: {
    marginTop: 6,
    color: "#6B7280",
    fontSize: 13.5,
    textAlign: "center",
    lineHeight: 19,
  },

  noDataBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF1F6",
    borderStyle: "dashed",
  },

  noData: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 13.5,
  },
});