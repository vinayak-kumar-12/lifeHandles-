import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTasks } from "../context/TaskContext";

// Master Service Task Catalog
const TASK_SERVICES = [
  {
    id: "home-cleaning",
    name: "House Cleaning",
    description: "Professional deep cleaning for your entire home",
    category: "Cleaning",
    icon: "sparkles-outline",
  },
  {
    id: "electrician",
    name: "Electrician",
    description: "Electrical repairs, wiring, switches & installations",
    category: "Repair",
    icon: "flash-outline",
  },
  {
    id: "plumbing",
    name: "Plumbing",
    description: "Pipe leakages, tap fittings & drainage solutions",
    category: "Repair",
    icon: "water-outline",
  },
  {
    id: "ac-service",
    name: "AC Repair & Servicing",
    description: "AC servicing, gas refill & cooling diagnostics",
    category: "Repair",
    icon: "snow-outline",
  },
  {
    id: "appliance-repair",
    name: "Appliance Repair",
    description: "Refrigerator, washing machine & microwave repair",
    category: "Repair",
    icon: "construct-outline",
  },
  {
    id: "painting",
    name: "Painting",
    description: "Full house or single wall accent painting",
    category: "Home",
    icon: "color-palette-outline",
  },
  {
    id: "moving-assistance",
    name: "Moving Assistance",
    description: "Packing, heavy lifting & relocation support",
    category: "Home",
    icon: "cube-outline",
  },
  {
    id: "gardening",
    name: "Gardening",
    description: "Lawn care, plant trimming & garden maintenance",
    category: "Personal",
    icon: "leaf-outline",
  },
  {
    id: "kitchen-cleaning",
    name: "Deep Kitchen Cleaning",
    description: "Thorough grease removal & kitchen appliance clean",
    category: "Cleaning",
    icon: "restaurant-outline",
  },
  {
    id: "sofa-carpet-cleaning",
    name: "Sofa & Carpet Cleaning",
    description: "Stain removal & fabric shampooing service",
    category: "Cleaning",
    icon: "layers-outline",
  },
  {
    id: "handyman",
    name: "Handyman Services",
    description: "Furniture assembly, wall mounting & minor fixes",
    category: "Repair",
    icon: "hammer-outline",
  },
  {
    id: "car-bike-wash",
    name: "Car & Bike Wash",
    description: "At-home exterior wash & interior detailing",
    category: "Personal",
    icon: "car-outline",
  },
  {
    id: "pet-care",
    name: "Pet Care & Walking",
    description: "Pet feeding, walking & basic grooming support",
    category: "Personal",
    icon: "paw-outline",
  },
  {
    id: "elderly-care",
    name: "Elderly Care Assistance",
    description: "Companionship, medicine reminders & mobility help",
    category: "Other",
    icon: "heart-outline",
  },
];

const CATEGORIES = ["All", "Home", "Repair", "Cleaning", "Personal", "Other"];

export default function TaskSelectionScreen() {
  const { isTaskSelected } = useTasks();
  const [selectedCategoryId, setSelectedCategoryId] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter tasks based on category & search query
  const filteredTasks = useMemo(() => {
    return TASK_SERVICES.filter((task) => {
      const matchesCategory =
        selectedCategoryId === "All" || task.category === selectedCategoryId;
      const matchesSearch =
        task.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategoryId, searchQuery]);

  // Retrieve selected task object
  const selectedTaskObj = useMemo(() => {
    return TASK_SERVICES.find((task) => task.id === selectedTaskId) || null;
  }, [selectedTaskId]);

  const handleSelectTask = (taskId) => {
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    } else {
      setSelectedTaskId(taskId);
    }
  };

  const handleContinue = () => {
    if (!selectedTaskObj) return;

    // Navigate to confirmation screen with task data
    router.push({
      pathname: "/task-confirmation",
      params: {
        taskId: selectedTaskObj.id,
        taskTitle: selectedTaskObj.name,
        taskCategory: selectedTaskObj.category,
        taskDescription: selectedTaskObj.description,
        taskIcon: selectedTaskObj.icon,
      },
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({ pathname: "/home", params: { tab: "tasks" } });
    }
  };

  return (
    <SafeAreaViewContext style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      {/* Main Layout Container */}
      <View style={styles.container}>
        {/* 1. TOP HEADER */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>What do you need help with?</Text>
            <Text style={styles.headerSubtext}>Select a service to continue</Text>
          </View>
        </View>

        {/* 2. TASK SEARCH */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBar,
              isSearchFocused && styles.searchBarFocused,
            ]}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={isSearchFocused ? "#35C96B" : "#94A3B8"}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a service..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 3. TASK CATEGORIES */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContainer}
          >
            {CATEGORIES.map((category) => {
              const isActive = selectedCategoryId === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryPill,
                    isActive ? styles.categoryPillActive : styles.categoryPillInactive,
                  ]}
                  onPress={() => setSelectedCategoryId(category)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isActive ? styles.categoryTextActive : styles.categoryTextInactive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. TASK LIST */}
        <ScrollView
          style={styles.listScrollView}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={40} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No services found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try searching for another task or clear category filter.
              </Text>
            </View>
          ) : (
            filteredTasks.map((task) => {
              const isSelected = selectedTaskId === task.id;
              const alreadyActiveInDashboard = isTaskSelected(task.id);

              return (
                <TouchableOpacity
                  key={task.id}
                  style={[
                    styles.taskRow,
                    isSelected ? styles.taskRowSelected : styles.taskRowUnselected,
                  ]}
                  onPress={() => handleSelectTask(task.id)}
                  activeOpacity={0.8}
                >
                  {/* Icon */}
                  <View
                    style={[
                      styles.iconContainer,
                      isSelected
                        ? styles.iconContainerSelected
                        : styles.iconContainerUnselected,
                    ]}
                  >
                    <Ionicons
                      name={task.icon}
                      size={20}
                      color={isSelected ? "#35C96B" : "#475569"}
                    />
                  </View>

                  {/* Task Text */}
                  <View style={styles.taskTextContainer}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text
                        style={[
                          styles.taskName,
                          isSelected && styles.taskNameSelected,
                        ]}
                      >
                        {task.name}
                      </Text>
                      {alreadyActiveInDashboard && (
                        <View style={styles.activeTag}>
                          <Text style={styles.activeTagText}>Active</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.taskDescription} numberOfLines={1}>
                      {task.description}
                    </Text>
                  </View>

                  {/* Right Selection Indicator */}
                  <View style={styles.selectionIndicatorContainer}>
                    {isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#35C96B"
                      />
                    ) : (
                      <View style={styles.unselectedRadioCircle}>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="#CBD5E1"
                        />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* 5. BOTTOM ACTION AREA */}
        <View style={styles.bottomActionContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Selected Service:</Text>
            <Text
              style={[
                styles.summaryValue,
                !selectedTaskObj && styles.summaryValueEmpty,
              ]}
              numberOfLines={1}
            >
              {selectedTaskObj ? selectedTaskObj.name : "None selected"}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedTaskObj ? styles.continueButtonDisabled : styles.continueButtonActive,
            ]}
            disabled={!selectedTaskObj}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.continueButtonText,
                !selectedTaskObj && styles.continueButtonTextDisabled,
              ]}
            >
              Continue
            </Text>
            {selectedTaskObj && (
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFFFFF"
                style={styles.continueIcon}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaViewContext>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },

  /* HEADER */
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#FAFAFA",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  headerTextGroup: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  headerSubtext: {
    fontSize: 14,
    fontWeight: "400",
    color: "#64748B",
  },

  /* SEARCH BAR */
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
  },
  searchBarFocused: {
    borderColor: "#35C96B",
    backgroundColor: "#FFFFFF",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    height: "100%",
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },

  /* CATEGORIES */
  categorySection: {
    paddingBottom: 16,
  },
  categoryScrollContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryPillActive: {
    backgroundColor: "#0F172A",
  },
  categoryPillInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  categoryTextInactive: {
    color: "#64748B",
  },

  /* TASK LIST */
  listScrollView: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    minHeight: 68,
  },
  taskRowUnselected: {
    borderColor: "#E2E8F0",
  },
  taskRowSelected: {
    borderColor: "#35C96B",
    backgroundColor: "#F0FDF4",
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconContainerUnselected: {
    backgroundColor: "#F8FAFC",
  },
  iconContainerSelected: {
    backgroundColor: "#DCFCE7",
  },
  taskTextContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 3,
  },
  taskName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  taskNameSelected: {
    color: "#0F291E",
    fontWeight: "700",
  },
  taskDescription: {
    fontSize: 13,
    color: "#64748B",
  },
  activeTag: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#166534",
  },
  selectionIndicatorContainer: {
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  unselectedRadioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  /* EMPTY STATE */
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
    marginTop: 8,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
  },

  /* BOTTOM ACTION AREA */
  bottomActionContainer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 14 : 20,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    maxWidth: "60%",
  },
  summaryValueEmpty: {
    color: "#94A3B8",
    fontWeight: "400",
    fontStyle: "italic",
  },
  continueButton: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonActive: {
    backgroundColor: "#35C96B",
  },
  continueButtonDisabled: {
    backgroundColor: "#E2E8F0",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  continueButtonTextDisabled: {
    color: "#94A3B8",
  },
  continueIcon: {
    marginLeft: 8,
  },
});
