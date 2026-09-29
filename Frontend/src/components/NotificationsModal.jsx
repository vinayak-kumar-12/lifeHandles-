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

export default function NotificationsModal({ visible, onClose, onSave }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [emailDigest, setEmailDigest] = useState(true);

  const handleDone = () => {
    onSave({ pushEnabled, orderUpdates, promotions, emailDigest });
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
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity onPress={handleDone} style={styles.saveBtn}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.subtext}>
            Control how and when PadosiPro notifies you about service bookings and neighborhood updates.
          </Text>

          <View style={styles.list}>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Text style={styles.title}>Push Notifications</Text>
                <Text style={styles.desc}>Receive instant alerts on your mobile device</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: "#E2E8F0", true: "#BBF7D0" }}
                thumbColor={pushEnabled ? "#35C96B" : "#94A3B8"}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Text style={styles.title}>Service Status Updates</Text>
                <Text style={styles.desc}>Real-time tracking of scheduled service agents</Text>
              </View>
              <Switch
                value={orderUpdates}
                onValueChange={setOrderUpdates}
                trackColor={{ false: "#E2E8F0", true: "#BBF7D0" }}
                thumbColor={orderUpdates ? "#35C96B" : "#94A3B8"}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Text style={styles.title}>Offers & Promotions</Text>
                <Text style={styles.desc}>Discounts on local neighborhood services</Text>
              </View>
              <Switch
                value={promotions}
                onValueChange={setPromotions}
                trackColor={{ false: "#E2E8F0", true: "#BBF7D0" }}
                thumbColor={promotions ? "#35C96B" : "#94A3B8"}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Text style={styles.title}>Email Digest</Text>
                <Text style={styles.desc}>Weekly activity and invoice summary</Text>
              </View>
              <Switch
                value={emailDigest}
                onValueChange={setEmailDigest}
                trackColor={{ false: "#E2E8F0", true: "#BBF7D0" }}
                thumbColor={emailDigest ? "#35C96B" : "#94A3B8"}
              />
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
  saveBtn: { paddingVertical: 8, paddingLeft: 12 },
  saveText: { fontSize: 16, fontWeight: "700", color: "#35C96B" },
  content: { padding: 20 },
  subtext: { fontSize: 14, color: "#64748B", marginBottom: 20, lineHeight: 20 },
  list: { gap: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  textContainer: { flex: 1, paddingRight: 10 },
  title: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
  desc: { fontSize: 12, color: "#64748B", marginTop: 2 },
});
