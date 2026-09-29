import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTasks } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";
import { getApiBase } from "../api/client";

// Resolve profile image URL (backend returns relative paths like /uploads/profiles/...)
const resolveImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http") || img.startsWith("file://")) return img;
  return `${getApiBase()}${img}`;
};

// Explore Services Data
const EXPLORE_SERVICES = [
  {
    id: "s1",
    category: "Home",
    name: "Deep Home Cleaning",
    description: "Professional room sanitization & spotless deep clean.",
    icon: "sparkles-outline",
  },
  {
    id: "s2",
    category: "Lifestyle",
    name: "Personal Errands & Laundry",
    description: "Wash, fold, and daily doorstep delivery handled.",
    icon: "shirt-outline",
  },
  {
    id: "s3",
    category: "Healthcare",
    name: "Medicine & Chaperone",
    description: "Prescription pickup and elderly care assistance.",
    icon: "medical-outline",
  },
  {
    id: "s4",
    category: "Travel",
    name: "Luggage & Airport Assist",
    description: "Hassle-free baggage transport and arrival support.",
    icon: "airplane-outline",
  },
  {
    id: "s5",
    category: "Personal",
    name: "Package & Pet Care",
    description: "Local parcel pickup and pet walking services.",
    icon: "paw-outline",
  },
];

export default function HomeScreen() {
  const params = useLocalSearchParams();
  const { tasks } = useTasks();
  const { user } = useAuth();

  const [activeTabState, setActiveTabState] = useState(null);
  const activeTab = activeTabState ?? (params.tab === "tasks" ? "tasks" : "home");

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);

  // Derive user display name & initials
  const displayName = user?.fullName ? user.fullName.split(" ")[0] : "User";
  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "VP";
  const profileImageUrl = resolveImageUrl(user?.profileImage);

  // Filter tasks based on search bar
  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Helper to render icon for task
  const renderTaskIcon = (iconName) => {
    if (!iconName) return <Ionicons name="construct-outline" size={20} color="#35C96B" />;
    
    // Check if icon is an emoji or ionic icon
    if (iconName.length <= 2) {
      return <Text style={{ fontSize: 20 }}>{iconName}</Text>;
    }
    return <Ionicons name={iconName} size={20} color="#35C96B" />;
  };

  // Helper to render status badge pill matching reference UI
  const renderStatusBadge = (status) => {
    const s = status || "Scheduled";
    if (s === "Scheduled") {
      return (
        <View style={styles.badgeScheduled}>
          <Text style={styles.badgeScheduledText}>Scheduled</Text>
        </View>
      );
    }
    if (s === "In Progress") {
      return (
        <View style={styles.badgeInProgress}>
          <Text style={styles.badgeInProgressText}>In Progress</Text>
        </View>
      );
    }
    return (
      <View style={styles.badgeAvailable}>
        <Text style={styles.badgeAvailableText}>{s}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.mainContainer}>
        {/* ==================== HOME TAB ==================== */}
        {activeTab === "home" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. TOP HEADER */}
            <View style={styles.topHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.greetingTitle}>Welcome back, {displayName}</Text>
                <Text style={styles.greetingSubtitle}>
                  Your lifestyle, handled.
                </Text>
              </View>

              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.notificationBtn}
                  activeOpacity={0.7}
                  onPress={() => setHasUnreadNotification(false)}
                >
                  <Ionicons name="notifications-outline" size={20} color="#0F172A" />
                  {hasUnreadNotification && <View style={styles.unreadDot} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.avatarBtn}
                  activeOpacity={0.8}
                  onPress={() => router.push("/profile")}
                >
                  {profileImageUrl ? (
                    <Image source={{ uri: profileImageUrl }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{userInitials}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. SEARCH BAR */}
            <View
              style={[
                styles.searchWrapper,
                isSearchFocused && styles.searchWrapperFocused,
              ]}
            >
              <Ionicons
                name="search-outline"
                size={20}
                color={isSearchFocused ? "#35C96B" : "#94A3B8"}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="What can we help you with?"
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={styles.clearSearchBtn}
                >
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* 3. QUICK ACTION AREA */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Quick actions</Text>
              <View style={styles.quickActionsRow}>
                <TouchableOpacity
                  style={styles.actionCard}
                  activeOpacity={0.8}
                  onPress={() => router.push("/task-selection")}
                >
                  <View style={styles.actionIconContainer}>
                    <Ionicons name="sparkles-outline" size={20} color="#35C96B" />
                  </View>
                  <Text style={styles.actionCardTitle}>+ Select Task</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab("tasks")}
                >
                  <View style={styles.actionIconContainer}>
                    <Ionicons name="clipboard-outline" size={20} color="#35C96B" />
                  </View>
                  <Text style={styles.actionCardTitle}>View Tasks</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  activeOpacity={0.8}
                  onPress={() => router.push("/profile")}
                >
                  <View style={styles.actionIconContainer}>
                    <Ionicons name="person-outline" size={20} color="#35C96B" />
                  </View>
                  <Text style={styles.actionCardTitle}>My Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 4. MY TASKS / ACTIVE TASKS (SHARED STATE SOURCE OF TRUTH) */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>My Tasks</Text>
                  <Text style={styles.sectionSubtitle}>
                    Active & scheduled neighborhood services
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/task-selection")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addServiceLink}>+ Select Task</Text>
                </TouchableOpacity>
              </View>

              {filteredTasks.length > 0 ? (
                <View style={styles.taskCardsList}>
                  {filteredTasks.map((task) => (
                    <TouchableOpacity
                      key={task.id}
                      style={styles.taskCardOverview}
                      activeOpacity={0.85}
                      onPress={() => setActiveTab("tasks")}
                    >
                      <View style={styles.taskCardLeft}>
                        <View style={styles.taskIconCircle}>
                          {renderTaskIcon(task.icon)}
                        </View>
                        <View style={styles.taskTextGroup}>
                          <Text style={styles.taskName}>{task.title}</Text>
                          <Text style={styles.taskTimeText}>
                            {task.category} • {task.scheduledDate || "Today"},{" "}
                            {task.scheduledTime || "10:00 AM"}
                          </Text>
                        </View>
                      </View>
                      {renderStatusBadge(task.status)}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                /* Minimal Empty State */
                <View style={styles.minimalEmptyState}>
                  <Text style={styles.emptyTitle}>No tasks yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Select a service to get started.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptySelectBtn}
                    onPress={() => router.push("/task-selection")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.emptySelectBtnText}>+ Select Task</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 5. EXPLORE SERVICES */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Explore services</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.exploreScrollContainer}
              >
                {EXPLORE_SERVICES.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.exploreCard}
                    activeOpacity={0.85}
                    onPress={() => router.push("/task-selection")}
                  >
                    <View style={styles.exploreHeader}>
                      <View style={styles.exploreIconBg}>
                        <Ionicons name={item.icon} size={20} color="#35C96B" />
                      </View>
                      <View style={styles.exploreCategoryBadge}>
                        <Text style={styles.exploreCategoryText}>
                          {item.category}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.exploreCardTitle}>{item.name}</Text>
                    <Text style={styles.exploreCardDesc}>{item.description}</Text>

                    <View style={styles.exploreCardFooter}>
                      <Text style={styles.exploreActionText}>Book now</Text>
                      <Ionicons name="arrow-forward" size={14} color="#35C96B" />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        )}

        {/* ==================== TASKS DASHBOARD TAB ==================== */}
        {activeTab === "tasks" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header section matching reference UI */}
            <View style={styles.tabHeaderSection}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.tabHeaderTitle}>Tasks Dashboard</Text>
                  <Text style={styles.tabHeaderSubtitle}>
                    Manage active and scheduled neighborhood services
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.headerAddBtn}
                  onPress={() => router.push("/task-selection")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.headerAddBtnText}>+ Select Task</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Dynamic List from Shared Task Context */}
            {filteredTasks.length > 0 ? (
              <View style={styles.taskCardsList}>
                {filteredTasks.map((task) => (
                  <View key={task.id} style={styles.taskCardOverview}>
                    <View style={styles.taskCardLeft}>
                      <View style={styles.taskIconCircle}>
                        {renderTaskIcon(task.icon)}
                      </View>
                      <View style={styles.taskTextGroup}>
                        <Text style={styles.taskName}>{task.title}</Text>
                        <Text style={styles.taskTimeText}>
                          {task.category} • {task.scheduledDate || "Today"},{" "}
                          {task.scheduledTime || "10:00 AM"}
                        </Text>
                      </View>
                    </View>
                    {renderStatusBadge(task.status)}
                  </View>
                ))}
              </View>
            ) : (
              /* Minimal Empty State as per specification */
              <View style={styles.minimalEmptyState}>
                <Text style={styles.emptyTitle}>No tasks yet</Text>
                <Text style={styles.emptySubtitle}>
                  Select a service to get started.
                </Text>
                <TouchableOpacity
                  style={styles.emptySelectBtn}
                  onPress={() => router.push("/task-selection")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptySelectBtnText}>+ Select Task</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

        {/* 7. BOTTOM NAVIGATION BAR */}
        <View style={styles.bottomNavBar}>
          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.8}
            onPress={() => setActiveTab("home")}
          >
            <Ionicons
              name={activeTab === "home" ? "home" : "home-outline"}
              size={22}
              color={activeTab === "home" ? "#35C96B" : "#94A3B8"}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === "home" && styles.navLabelActive,
              ]}
            >
              Home
            </Text>
            {activeTab === "home" && <View style={styles.navIndicatorDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.8}
            onPress={() => setActiveTab("tasks")}
          >
            <Ionicons
              name={activeTab === "tasks" ? "clipboard" : "clipboard-outline"}
              size={22}
              color={activeTab === "tasks" ? "#35C96B" : "#94A3B8"}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === "tasks" && styles.navLabelActive,
              ]}
            >
              Tasks
            </Text>
            {activeTab === "tasks" && <View style={styles.navIndicatorDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.8}
            onPress={() => router.push("/profile")}
          >
            <Ionicons name="person-outline" size={22} color="#94A3B8" />
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },

  /* HEADER */
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    gap: 2,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#35C96B",
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },

  /* SEARCH BAR */
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  searchWrapperFocused: {
    borderColor: "#35C96B",
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    height: "100%",
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },

  /* SECTIONS */
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  addServiceLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#35C96B",
  },

  /* QUICK ACTIONS */
  quickActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 8,
  },
  actionIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionCardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
  },

  /* TASK DASHBOARD LIST & CARDS (MATCHING REFERENCE UI) */
  tabHeaderSection: {
    marginBottom: 20,
  },
  tabHeaderTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  tabHeaderSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  headerAddBtn: {
    backgroundColor: "#35C96B",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  headerAddBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  taskCardsList: {
    gap: 12,
  },
  taskCardOverview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 76,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  taskCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  taskIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  taskTextGroup: {
    flex: 1,
    gap: 3,
  },
  taskName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  taskTimeText: {
    fontSize: 13,
    color: "#64748B",
  },

  /* STATUS BADGES (MATCHING REFERENCE UI) */
  badgeScheduled: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#35C96B",
    backgroundColor: "transparent",
  },
  badgeScheduledText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#35C96B",
  },
  badgeInProgress: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#86EFAC",
    backgroundColor: "#DCFCE7",
  },
  badgeInProgressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#15803D",
  },
  badgeAvailable: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  badgeAvailableText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },

  /* MINIMAL EMPTY STATE */
  minimalEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },
  emptySelectBtn: {
    marginTop: 8,
    backgroundColor: "#35C96B",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptySelectBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  /* EXPLORE SERVICES */
  exploreScrollContainer: {
    gap: 12,
    paddingRight: 20,
  },
  exploreCard: {
    width: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    justifyContent: "space-between",
  },
  exploreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  exploreIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  exploreCategoryBadge: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  exploreCategoryText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
  },
  exploreCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  exploreCardDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
    marginBottom: 12,
  },
  exploreCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exploreActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#35C96B",
  },

  /* BOTTOM NAVBAR */
  bottomNavBar: {
    flexDirection: "row",
    height: 64,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 2,
  },
  navLabelActive: {
    color: "#35C96B",
    fontWeight: "700",
  },
  navIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#35C96B",
    position: "absolute",
    bottom: 6,
  },
});
