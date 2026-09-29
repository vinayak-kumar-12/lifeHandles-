import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfileModal({
  visible,
  user,
  onClose,
  onSaveProfile,
  onRequestOtp,
  onOpenImagePicker,
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [prevVisible, setPrevVisible] = useState(false);

  if (visible && !prevVisible) {
    setPrevVisible(true);
    setFullName(user?.fullName || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setErrors({});
    setIsSaving(false);
  } else if (!visible && prevVisible) {
    setPrevVisible(false);
  }

  const validateForm = () => {
    const newErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      newErrors.email = "Please enter a valid email address.";
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phone = "Enter a valid 10-digit phone number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const emailChanged = email.trim() !== user?.email;
    const phoneChanged = phone.trim() !== user?.phone;

    if (emailChanged) {
      onRequestOtp("email", email.trim(), () => {
        if (phoneChanged) {
          onRequestOtp("phone", phone.trim(), () => {
            submitUpdate();
          });
        } else {
          submitUpdate();
        }
      });
      return;
    }

    if (phoneChanged) {
      onRequestOtp("phone", phone.trim(), () => {
        submitUpdate();
      });
      return;
    }

    submitUpdate();
  };

  const submitUpdate = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSaveProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
    }, 600);
  };

  const getInitials = (name) => {
    if (!name) return "VK";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaWrapper>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveHeaderBtn}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#35C96B" />
              ) : (
                <Text style={styles.saveHeaderText}>Done</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Profile Avatar Section */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarContainer}
                activeOpacity={0.8}
                onPress={onOpenImagePicker}
              >
                {user?.profileImage ? (
                  <Image source={{ uri: user.profileImage }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarInitialsBox}>
                    <Text style={styles.avatarInitials}>{getInitials(fullName)}</Text>
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={onOpenImagePicker}>
                <Text style={styles.changePhotoText}>Change Profile Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Input Form */}
            <View style={styles.formSection}>
              {/* Full Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.fullName ? styles.inputError : null,
                  ]}
                >
                  <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      if (errors.fullName) setErrors({ ...errors, fullName: null });
                    }}
                    placeholder="Enter full name"
                    placeholderTextColor="#94A3B8"
                  />
                  {fullName ? (
                    <TouchableOpacity onPress={() => setFullName("")}>
                      <Ionicons name="close-circle" size={16} color="#CBD5E1" />
                    </TouchableOpacity>
                  ) : null}
                </View>
                {errors.fullName ? (
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                ) : null}
              </View>

              {/* Email Address */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  {user?.emailVerified && (
                    <View style={styles.verifiedTag}>
                      <Ionicons name="checkmark-circle" size={12} color="#166534" />
                      <Text style={styles.verifiedTagText}>Verified</Text>
                    </View>
                  )}
                </View>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.email ? styles.inputError : null,
                  ]}
                >
                  <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    placeholder="name@example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : (
                  <Text style={styles.hintText}>
                    Changing email requires OTP verification.
                  </Text>
                )}
              </View>

              {/* Phone Number */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.fieldLabel}>Phone Number</Text>
                  {user?.phoneVerified && (
                    <View style={styles.verifiedTag}>
                      <Ionicons name="checkmark-circle" size={12} color="#166534" />
                      <Text style={styles.verifiedTagText}>Verified</Text>
                    </View>
                  )}
                </View>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.phone ? styles.inputError : null,
                  ]}
                >
                  <Ionicons name="call-outline" size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      if (errors.phone) setErrors({ ...errors, phone: null });
                    }}
                    placeholder="+91 98765 43210"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                  />
                </View>
                {errors.phone ? (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                ) : (
                  <Text style={styles.hintText}>
                    Changing phone requires OTP verification.
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Sticky Save Button near Bottom */}
          <View style={styles.footerBar}>
            <TouchableOpacity
              style={styles.saveBtn}
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaWrapper>
    </Modal>
  );
}

function SafeAreaWrapper({ children }) {
  if (Platform.OS === "ios") {
    return <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>{children}</View>;
  }
  return <View style={{ flex: 1, backgroundColor: "#FFFFFF", paddingTop: 10 }}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  cancelBtn: {
    paddingVertical: 8,
    paddingRight: 12,
  },
  cancelText: {
    fontSize: 16,
    color: "#64748B",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  saveHeaderBtn: {
    paddingVertical: 8,
    paddingLeft: 12,
  },
  saveHeaderText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#35C96B",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: 12,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  avatarImg: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarInitialsBox: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#35C96B",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#0F172A",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#35C96B",
  },
  formSection: {
    gap: 20,
    marginTop: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#166534",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    height: "100%",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
    marginTop: 2,
  },
  hintText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  saveBtn: {
    backgroundColor: "#35C96B",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
