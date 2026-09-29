import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

// Helper components
import Toast from "../components/Toast";
import ImagePickerModal from "../components/ImagePickerModal";
import EditProfileModal from "../components/EditProfileModal";
import OtpVerificationModal from "../components/OtpVerificationModal";
import EditAddressModal from "../components/EditAddressModal";
import ServicesModal from "../components/ServicesModal";
import NotificationsModal from "../components/NotificationsModal";
import SavedAddressesModal from "../components/SavedAddressesModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { getApiBase } from "../api/client";

// Resolve profile image URL (backend returns relative paths like /uploads/profiles/...)
const resolveImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http") || img.startsWith("file://")) return img;
  return `${getApiBase()}${img}`;
};

// Initial user state matching requirement #13 data model mindset
const INITIAL_USER_DATA = {
  id: "usr_padosi_998",
  fullName: "Vinayak Kumar",
  email: "vinayak@example.com",
  phone: "+91 98765 43210",
  profileImage: null, // null triggers fallback initials avatar "VK"
  address: {
    houseNumber: "House No. 24",
    building: "Skyline Apartments",
    street: "Street 5",
    locality: "Kusmunda",
    area: "Nehru Nagar Area",
    city: "Korba",
    state: "Chhattisgarh",
    pincode: "495454",
    country: "India",
  },
  emailVerified: true,
  phoneVerified: true,
  role: "PadosiPro Customer",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2026-09-28T09:00:00Z",
};

export default function ProfileScreen() {
  const { user: authUser, logout, refreshUser, updateProfile, uploadProfileImage, removeProfileImage } = useAuth();

  // Merge auth user with local UI state (address, etc.) 
  const [user, setUser] = useState({
    id: authUser?.id || "",
    fullName: authUser?.fullName || "Vinayak Kumar",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    profileImage: authUser?.profileImage || null,
    address: {
      houseNumber: "",
      building: "",
      street: "",
      locality: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
    emailVerified: authUser?.emailVerified ?? true,
    phoneVerified: false,
    role: "PadosiPro Customer",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Sync auth user changes into local state
  useEffect(() => {
    if (authUser) {
      setUser((prev) => ({
        ...prev,
        id: authUser.id || prev.id,
        fullName: authUser.fullName || prev.fullName,
        email: authUser.email || prev.email,
        phone: authUser.phone || prev.phone,
        profileImage: authUser.profileImage ?? prev.profileImage,
        emailVerified: authUser.emailVerified ?? prev.emailVerified,
      }));
    }
  }, [authUser]);

  // Loading state for avatar upload
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Modals state
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditAddress, setShowEditAddress] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSavedAddressesModal, setShowSavedAddressesModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // OTP Verification state
  const [otpTarget, setOtpTarget] = useState({ type: "", value: "", callback: null });
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const handleToastDismiss = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const triggerToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
  };

  const getInitials = (name) => {
    if (!name) return "VK";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Image Upload Handler — real backend upload
  const handleImageSelected = async (imageUri) => {
    setIsUploadingImage(true);
    try {
      await uploadProfileImage(imageUri);
      triggerToast("Profile picture updated successfully!");
    } catch (err) {
      triggerToast(err.message || "Failed to upload profile picture", "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploadingImage(true);
    try {
      await removeProfileImage();
      triggerToast("Profile picture removed.");
    } catch (err) {
      triggerToast(err.message || "Failed to remove profile picture", "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Profile Edit Handlers
  const handleSaveProfile = async (updatedFields) => {
    try {
      await updateProfile(updatedFields);
      setUser((prev) => ({
        ...prev,
        ...updatedFields,
      }));
      setShowEditProfile(false);
      triggerToast("Personal information updated!");
    } catch (err) {
      triggerToast(err.message || "Failed to update profile", "error");
    }
  };

  const handleRequestOtp = (type, value, onComplete) => {
    setOtpTarget({ type, value, callback: onComplete });
    setShowOtpModal(true);
  };

  const handleOtpVerifySuccess = () => {
    setShowOtpModal(false);
    if (otpTarget.callback) {
      otpTarget.callback();
    }
    if (otpTarget.type === "email") {
      setUser((prev) => ({ ...prev, emailVerified: true }));
    } else if (otpTarget.type === "phone") {
      setUser((prev) => ({ ...prev, phoneVerified: true }));
    }
    triggerToast(`${otpTarget.type === "email" ? "Email" : "Phone"} verified successfully!`);
  };

  // Address Handlers
  const handleSaveAddress = async (newAddress) => {
    try {
      const fullAddr = [newAddress.houseNumber, newAddress.building, newAddress.street, newAddress.locality, newAddress.area]
        .filter(Boolean)
        .join(", ");
      await updateProfile({
        address: fullAddr,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
      });
      setUser((prev) => ({
        ...prev,
        address: newAddress,
      }));
      setShowEditAddress(false);
      triggerToast("Primary address updated!");
    } catch (err) {
      triggerToast(err.message || "Failed to update address", "error");
    }
  };

  // Logout Handler
  const handleLogout = () => {
    Alert.alert(
      "Logout from PadosiPro",
      "Are you sure you want to log out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/login");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      {/* Animated Toast Feedback */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={handleToastDismiss}
      />

      {/* 1. TOP APP BAR */}
      <View style={styles.topAppBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/home");
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>My Profile</Text>

        <TouchableOpacity
          style={styles.headerEditBtn}
          onPress={() => setShowEditProfile(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={22} color="#35C96B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. PROFILE HEADER */}
        <View style={styles.profileHeaderContainer}>
          <TouchableOpacity
            style={styles.avatarTouchable}
            activeOpacity={0.85}
            onPress={() => setShowImagePicker(true)}
          >
            {resolveImageUrl(user.profileImage) ? (
              <Image source={{ uri: resolveImageUrl(user.profileImage) }} style={styles.avatarImage} />
            ) : (
              <View style={styles.initialsAvatar}>
                <Text style={styles.initialsText}>{getInitials(user.fullName)}</Text>
              </View>
            )}

            {isUploadingImage ? (
              <View style={styles.avatarLoadingOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            ) : (
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.userName}>{user.fullName}</Text>

          <View style={styles.emailRow}>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.emailVerified && (
              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark-circle" size={12} color="#166534" />
                <Text style={styles.verifiedPillText}>Verified</Text>
              </View>
            )}
          </View>

          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{user.role}</Text>
          </View>
        </View>

        {/* 3. PERSONAL INFORMATION SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderTitle}>PERSONAL INFORMATION</Text>

          <View style={styles.cardContainer}>
            {/* Full Name Row */}
            <TouchableOpacity
              style={styles.infoRow}
              activeOpacity={0.7}
              onPress={() => setShowEditProfile(true)}
            >
              <View style={styles.infoIconBox}>
                <Ionicons name="person-outline" size={18} color="#475569" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{user.fullName}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Email Address Row */}
            <TouchableOpacity
              style={styles.infoRow}
              activeOpacity={0.7}
              onPress={() => setShowEditProfile(true)}
            >
              <View style={styles.infoIconBox}>
                <Ionicons name="mail-outline" size={18} color="#475569" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
              {user.emailVerified ? (
                <View style={styles.rowStatusTag}>
                  <Text style={styles.rowStatusText}>Verified</Text>
                </View>
              ) : null}
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Phone Number Row */}
            <TouchableOpacity
              style={styles.infoRow}
              activeOpacity={0.7}
              onPress={() => setShowEditProfile(true)}
            >
              <View style={styles.infoIconBox}>
                <Ionicons name="call-outline" size={18} color="#475569" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
              {user.phoneVerified ? (
                <View style={styles.rowStatusTag}>
                  <Text style={styles.rowStatusText}>Verified</Text>
                </View>
              ) : null}
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. ADDRESS INFORMATION SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>ADDRESS</Text>
            <TouchableOpacity
              onPress={() => setShowSavedAddressesModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionHeaderAction}>Saved Addresses</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addressCard}>
            <View style={styles.addressCardTop}>
              <View style={styles.addressHeaderTitleRow}>
                <View style={styles.locationPinBox}>
                  <Ionicons name="location-sharp" size={18} color="#35C96B" />
                </View>
                <Text style={styles.addressCardTitle}>Home Address</Text>
              </View>
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>Primary Address</Text>
              </View>
            </View>

            {/* Structured Address Layout */}
            <View style={styles.addressBody}>
              <Text style={styles.addressLineBold}>
                {user.address.houseNumber}
                {user.address.building ? `, ${user.address.building}` : ""}
              </Text>
              <Text style={styles.addressLine}>
                {user.address.street}
                {user.address.area ? `, ${user.address.area}` : ""}
              </Text>
              <Text style={styles.addressLine}>
                {user.address.city}, {user.address.state} - {user.address.pincode}
              </Text>
              <Text style={styles.addressLine}>{user.address.country}</Text>
            </View>

            {/* Address Card Actions */}
            <View style={styles.addressActionsRow}>
              <TouchableOpacity
                style={styles.editAddressBtn}
                activeOpacity={0.7}
                onPress={() => setShowEditAddress(true)}
              >
                <Ionicons name="pencil-outline" size={15} color="#35C96B" />
                <Text style={styles.editAddressBtnText}>Edit Address</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changeAddressBtn}
                activeOpacity={0.7}
                onPress={() => setShowSavedAddressesModal(true)}
              >
                <Text style={styles.changeAddressBtnText}>Change Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 5. SERVICE / ACCOUNT INFORMATION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderTitle}>ACCOUNT</Text>

          <View style={styles.cardContainer}>
            {/* My Selected Services */}
            <TouchableOpacity
              style={styles.navRow}
              activeOpacity={0.7}
              onPress={() => setShowServicesModal(true)}
            >
              <View style={[styles.navIconBox, { backgroundColor: "#F0FDF4" }]}>
                <Ionicons name="grid-outline" size={20} color="#35C96B" />
              </View>
              <View style={styles.navTextGroup}>
                <Text style={styles.navTitle}>My Selected Services</Text>
                <Text style={styles.navDesc}>
                  Manage the services selected during onboarding
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Saved Addresses */}
            <TouchableOpacity
              style={styles.navRow}
              activeOpacity={0.7}
              onPress={() => setShowSavedAddressesModal(true)}
            >
              <View style={[styles.navIconBox, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="bookmark-outline" size={20} color="#3B82F6" />
              </View>
              <View style={styles.navTextGroup}>
                <Text style={styles.navTitle}>Saved Addresses</Text>
                <Text style={styles.navDesc}>
                  Manage your saved delivery/service addresses
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Notifications */}
            <TouchableOpacity
              style={styles.navRow}
              activeOpacity={0.7}
              onPress={() => setShowNotificationsModal(true)}
            >
              <View style={[styles.navIconBox, { backgroundColor: "#F5F3FF" }]}>
                <Ionicons name="notifications-outline" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.navTextGroup}>
                <Text style={styles.navTitle}>Notifications</Text>
                <Text style={styles.navDesc}>Manage notification preferences</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. SECURITY SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderTitle}>SECURITY</Text>

          <View style={styles.cardContainer}>
            {/* Change Password */}
            <TouchableOpacity
              style={styles.navRow}
              activeOpacity={0.7}
              onPress={() => setShowChangePasswordModal(true)}
            >
              <View style={[styles.navIconBox, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="lock-closed-outline" size={20} color="#D97706" />
              </View>
              <View style={styles.navTextGroup}>
                <Text style={styles.navTitle}>Change Password</Text>
                <Text style={styles.navDesc}>Update your account password</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.divider} />

            {/* Email Verification Status */}
            <View style={styles.navRow}>
              <View style={[styles.navIconBox, { backgroundColor: "#F0FDF4" }]}>
                <Ionicons name="mail-unread-outline" size={20} color="#16A34A" />
              </View>
              <View style={styles.navTextGroup}>
                <Text style={styles.navTitle}>Email Verification</Text>
                <Text style={styles.navDesc}>{user.email}</Text>
              </View>
              {user.emailVerified ? (
                <View style={styles.securityBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                  <Text style={styles.securityBadgeText}>Verified</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.unverifiedBadgeBtn}
                  activeOpacity={0.7}
                  onPress={() => handleRequestOtp("email", user.email, null)}
                >
                  <Text style={styles.unverifiedBadgeText}>Verify Now</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.divider} />

            {/* Phone Verification Status */}
            <View style={styles.navRow}>
              <View style={[styles.navIconBox, { backgroundColor: "#F0FDF4" }]}>
                <Ionicons name="phone-portrait-outline" size={20} color="#16A34A" />
              </View>
              <View style={styles.navTextGroup}>
                <Text style={styles.navTitle}>Phone Verification</Text>
                <Text style={styles.navDesc}>{user.phone}</Text>
              </View>
              {user.phoneVerified ? (
                <View style={styles.securityBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                  <Text style={styles.securityBadgeText}>Verified</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.unverifiedBadgeBtn}
                  activeOpacity={0.7}
                  onPress={() => handleRequestOtp("phone", user.phone, null)}
                >
                  <Text style={styles.unverifiedBadgeText}>Verify Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* 7. ACCOUNT ACTIONS */}
        <View style={styles.accountActionsContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={18} color="#DC2626" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>PadosiPro v1.0.0</Text>
        </View>
      </ScrollView>

      {/* ALL INTERACTIVE MODALS & SHEETS */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelected={handleImageSelected}
        onRemovePhoto={handleRemovePhoto}
        hasImage={!!user.profileImage}
      />

      <EditProfileModal
        visible={showEditProfile}
        user={user}
        onClose={() => setShowEditProfile(false)}
        onSaveProfile={handleSaveProfile}
        onRequestOtp={handleRequestOtp}
        onOpenImagePicker={() => {
          setShowEditProfile(false);
          setShowImagePicker(true);
        }}
      />

      <OtpVerificationModal
        visible={showOtpModal}
        targetType={otpTarget.type}
        targetValue={otpTarget.value}
        onClose={() => setShowOtpModal(false)}
        onVerifySuccess={handleOtpVerifySuccess}
      />

      <EditAddressModal
        visible={showEditAddress}
        currentAddress={user.address}
        onClose={() => setShowEditAddress(false)}
        onSaveAddress={handleSaveAddress}
      />

      <ServicesModal
        visible={showServicesModal}
        onClose={() => setShowServicesModal(false)}
        onSave={() => triggerToast("Services preferences saved!")}
      />

      <NotificationsModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onSave={() => triggerToast("Notification settings updated!")}
      />

      <SavedAddressesModal
        visible={showSavedAddressesModal}
        primaryAddress={user.address}
        onClose={() => setShowSavedAddressesModal(false)}
        onOpenAddAddress={() => setShowEditAddress(true)}
        onSetPrimaryAddress={(newAddress) => {
          setUser((prev) => ({ ...prev, address: newAddress }));
          triggerToast(`Primary address set to ${newAddress.houseNumber}!`);
        }}
      />

      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => triggerToast("Password updated successfully!")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  topAppBar: {
    height: 56,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  headerEditBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
  },
  // Profile Header
  profileHeaderContainer: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarTouchable: {
    position: "relative",
    marginBottom: 14,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  initialsAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#35C96B",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    fontSize: 34,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#35C96B",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#64748B",
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  verifiedPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#166534",
  },
  roleBadge: {
    marginTop: 12,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  // Section Structure
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionHeaderAction: {
    fontSize: 13,
    fontWeight: "600",
    color: "#35C96B",
    marginBottom: 10,
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 56,
  },
  // Compact Info Rows
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoTextGroup: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  rowStatusTag: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  rowStatusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#166534",
  },
  // Address Card
  addressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  addressCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  addressHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationPinBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  addressCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  primaryBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  primaryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  addressBody: {
    gap: 3,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  addressLineBold: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  addressLine: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  addressActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
  },
  editAddressBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#F0FDF4",
  },
  editAddressBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#35C96B",
  },
  changeAddressBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  changeAddressBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  // Nav List Rows
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  navIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  navTextGroup: {
    flex: 1,
    paddingRight: 8,
  },
  navTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  navDesc: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 4,
  },
  securityBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
  },
  unverifiedBadgeBtn: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginRight: 4,
  },
  unverifiedBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
  },
  // Account Actions
  accountActionsContainer: {
    alignItems: "center",
    gap: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#DC2626",
  },
  versionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94A3B8",
  },
});
