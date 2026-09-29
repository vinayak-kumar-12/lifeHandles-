import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SavedAddressesModal({
  visible,
  primaryAddress,
  onClose,
  onOpenAddAddress,
  onSetPrimaryAddress,
}) {
  const workAddress = {
    houseNumber: "Office Suite 402",
    building: "IT Tech Park",
    street: "Commercial Complex",
    area: "Near City Center",
    city: "Korba",
    state: "Chhattisgarh",
    pincode: "495452",
    country: "India",
  };

  const handleSelectWorkAsPrimary = () => {
    if (onSetPrimaryAddress) {
      onSetPrimaryAddress(workAddress);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Addresses</Text>
          <TouchableOpacity
            onPress={() => {
              onClose();
              onOpenAddAddress();
            }}
            style={styles.addBtn}
          >
            <Ionicons name="add" size={20} color="#35C96B" />
            <Text style={styles.addText}>Add New</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.subtext}>
            Manage service delivery locations linked to your PadosiPro account.
          </Text>

          {/* Primary Address */}
          <View style={styles.cardPrimary}>
            <View style={styles.cardHeader}>
              <View style={styles.badgePrimary}>
                <Ionicons name="location" size={14} color="#166534" />
                <Text style={styles.badgeText}>Primary Address</Text>
              </View>
              <Text style={styles.tagText}>Home</Text>
            </View>

            <Text style={styles.addressLineBold}>
              {primaryAddress.houseNumber}{primaryAddress.building ? `, ${primaryAddress.building}` : ""}
            </Text>
            <Text style={styles.addressLine}>
              {primaryAddress.street}{primaryAddress.area ? `, ${primaryAddress.area}` : ""}
            </Text>
            <Text style={styles.addressLine}>
              {primaryAddress.city}, {primaryAddress.state} - {primaryAddress.pincode}
            </Text>
            <Text style={styles.addressLine}>{primaryAddress.country}</Text>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  onClose();
                  onOpenAddAddress();
                }}
              >
                <Ionicons name="pencil" size={14} color="#35C96B" />
                <Text style={styles.actionText}>Edit Details</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Additional Saved Address: Office */}
          <View style={styles.cardSecondary}>
            <View style={styles.cardHeader}>
              <View style={styles.badgeSecondary}>
                <Ionicons name="briefcase-outline" size={14} color="#64748B" />
                <Text style={styles.badgeTextSecondary}>Secondary Address</Text>
              </View>
              <Text style={styles.tagText}>Work</Text>
            </View>

            <Text style={styles.addressLineBold}>
              {workAddress.houseNumber}, {workAddress.building}
            </Text>
            <Text style={styles.addressLine}>
              {workAddress.street}, {workAddress.area}
            </Text>
            <Text style={styles.addressLine}>
              {workAddress.city}, {workAddress.state} - {workAddress.pincode}
            </Text>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionButtonSecondary}
                onPress={handleSelectWorkAsPrimary}
              >
                <Text style={styles.actionTextSecondary}>Set as Primary</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? 12 : 0,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cancelBtn: { paddingVertical: 8, paddingRight: 12 },
  cancelText: { fontSize: 16, color: "#64748B" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#0F172A" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 2, paddingVertical: 8 },
  addText: { fontSize: 15, fontWeight: "700", color: "#35C96B" },
  content: { padding: 20 },
  subtext: { fontSize: 14, color: "#64748B", marginBottom: 20, lineHeight: 20 },
  cardPrimary: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#35C96B",
    marginBottom: 16,
  },
  cardSecondary: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badgePrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#166534" },
  badgeSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeTextSecondary: { fontSize: 11, fontWeight: "600", color: "#64748B" },
  tagText: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  addressLineBold: { fontSize: 15, fontWeight: "700", color: "#0F172A", marginBottom: 4 },
  addressLine: { fontSize: 13, color: "#475569", lineHeight: 18 },
  cardActions: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
  },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { fontSize: 13, fontWeight: "700", color: "#35C96B" },
  actionButtonSecondary: { paddingVertical: 4 },
  actionTextSecondary: { fontSize: 13, fontWeight: "600", color: "#3B82F6" },
});
