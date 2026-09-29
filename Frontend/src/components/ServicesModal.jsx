import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const INITIAL_SERVICES = [
  {
    id: "s1",
    title: "Home & Room Cleaning",
    desc: "Daily or weekly deep sanitization",
    icon: "home-outline",
    active: true,
  },
  {
    id: "s2",
    title: "Grocery & Errand Delivery",
    desc: "Doorstep delivery from local stores",
    icon: "cart-outline",
    active: true,
  },
  {
    id: "s3",
    title: "AC & Appliance Repair",
    desc: "Professional servicing & maintenance",
    icon: "construct-outline",
    active: true,
  },
  {
    id: "s4",
    title: "Electrician & Plumbing",
    desc: "Emergency hardware fixes",
    icon: "flash-outline",
    active: false,
  },
  {
    id: "s5",
    title: "Laundry & Dry Cleaning",
    desc: "Wash, iron and delivery service",
    icon: "shirt-outline",
    active: false,
  },
];

export default function ServicesModal({ visible, onClose, onSave }) {
  const [services, setServices] = useState(INITIAL_SERVICES);

  const toggleService = (id) => {
    setServices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const handleDone = () => {
    onSave(services);
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
          <Text style={styles.headerTitle}>Selected Services</Text>
          <TouchableOpacity onPress={handleDone} style={styles.saveBtn}>
            <Text style={styles.saveText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.subtext}>
            Manage which neighborhood services are active for your PadosiPro home dashboard.
          </Text>

          <View style={styles.list}>
            {services.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.iconBox}>
                  <Ionicons name={item.icon} size={20} color="#35C96B" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.desc}>{item.desc}</Text>
                </View>
                <Switch
                  value={item.active}
                  onValueChange={() => toggleService(item.id)}
                  trackColor={{ false: "#E2E8F0", true: "#BBF7D0" }}
                  thumbColor={item.active ? "#35C96B" : "#94A3B8"}
                />
              </View>
            ))}
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
  saveBtn: { paddingVertical: 8, paddingLeft: 12 },
  saveText: { fontSize: 16, fontWeight: "700", color: "#35C96B" },
  content: { padding: 20 },
  subtext: { fontSize: 14, color: "#64748B", marginBottom: 20, lineHeight: 20 },
  list: { gap: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: { flex: 1, paddingRight: 10 },
  title: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
  desc: { fontSize: 12, color: "#64748B", marginTop: 2 },
});
