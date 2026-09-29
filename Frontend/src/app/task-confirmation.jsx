import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTasks } from "../context/TaskContext";

const DATE_OPTIONS = ["Today", "Tomorrow", "Oct 1", "Oct 2"];
const TIME_OPTIONS = ["10:00 AM", "11:30 AM", "2:30 PM", "4:00 PM"];

export default function TaskConfirmationScreen() {
  const params = useLocalSearchParams();
  const { addTask, isTaskSelected } = useTasks();

  const taskId = params.taskId || "custom-task";
  const taskTitle = params.taskTitle || "Home Cleaning";
  const taskCategory = params.taskCategory || "Home";
  const taskDescription =
    params.taskDescription || "Professional service for your home";
  const taskIcon = params.taskIcon || "home-outline";

  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const alreadyAdded = isTaskSelected(taskId);

  const handleConfirmTask = async () => {
    setIsSubmitting(true);
    try {
      await addTask({
        id: taskId,
        title: taskTitle,
        category: taskCategory,
        description: taskDescription,
        icon: taskIcon,
        status: "Scheduled",
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        createdAt: new Date().toISOString(),
      });
      router.replace({
        pathname: "/home",
        params: { tab: "tasks" },
      });
    } catch {
      // Navigate anyway using optimistic local state
      router.replace({
        pathname: "/home",
        params: { tab: "tasks" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/task-selection");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Schedule</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Service Card */}
        <View style={styles.card}>
          <View style={styles.cardIconCircle}>
            <Ionicons name={taskIcon} size={24} color="#35C96B" />
          </View>
          <View style={styles.cardDetails}>
            <Text style={styles.cardCategory}>{taskCategory}</Text>
            <Text style={styles.cardTitle}>{taskTitle}</Text>
            <Text style={styles.cardDescription}>{taskDescription}</Text>
          </View>
        </View>

        {alreadyAdded && (
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={18} color="#0284C7" />
            <Text style={styles.infoBannerText}>
              This task is currently in your schedule. Confirming will update the schedule.
            </Text>
          </View>
        )}

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <View style={styles.pillRow}>
            {DATE_OPTIONS.map((date) => {
              const isActive = selectedDate === date;
              return (
                <TouchableOpacity
                  key={date}
                  style={[
                    styles.pill,
                    isActive ? styles.pillActive : styles.pillInactive,
                  ]}
                  onPress={() => setSelectedDate(date)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isActive ? styles.pillTextActive : styles.pillTextInactive,
                    ]}
                  >
                    {date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time Slot</Text>
          <View style={styles.pillRow}>
            {TIME_OPTIONS.map((time) => {
              const isActive = selectedTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.pill,
                    isActive ? styles.pillActive : styles.pillInactive,
                  ]}
                  onPress={() => setSelectedTime(time)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isActive ? styles.pillTextActive : styles.pillTextInactive,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Scheduled For:</Text>
            <Text style={styles.summaryValue}>
              {selectedDate}, {selectedTime}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Initial Status:</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Scheduled</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
          onPress={handleConfirmTask}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>
                {alreadyAdded ? "Update Task Schedule" : "Confirm & Save Task"}
              </Text>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#FFFFFF"
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 14,
  },
  cardIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  cardDetails: {
    flex: 1,
    gap: 2,
  },
  cardCategory: {
    fontSize: 12,
    fontWeight: "600",
    color: "#35C96B",
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  cardDescription: {
    fontSize: 13,
    color: "#64748B",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#0369A1",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  pillInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  pillTextInactive: {
    color: "#64748B",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#35C96B",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  bottomBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 14 : 20,
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
  confirmButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#35C96B",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
