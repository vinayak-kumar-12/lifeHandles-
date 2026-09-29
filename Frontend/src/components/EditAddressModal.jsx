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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EditAddressModal({
  visible,
  currentAddress,
  onClose,
  onSaveAddress,
}) {
  const [houseNumber, setHouseNumber] = useState("");
  const [building, setBuilding] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");

  const [errors, setErrors] = useState({});
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [prevVisible, setPrevVisible] = useState(false);

  if (visible && !prevVisible) {
    setPrevVisible(true);
    setHouseNumber(currentAddress?.houseNumber || "");
    setBuilding(currentAddress?.building || "");
    setStreet(currentAddress?.street || "");
    setArea(currentAddress?.area || "");
    setCity(currentAddress?.city || "Korba");
    setState(currentAddress?.state || "Chhattisgarh");
    setPincode(currentAddress?.pincode || "495454");
    setCountry(currentAddress?.country || "India");
    setErrors({});
    setIsSaving(false);
  } else if (!visible && prevVisible) {
    setPrevVisible(false);
  }

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      setHouseNumber("Plot 42");
      setBuilding("Green Palms Residency");
      setStreet("VIP Road, Sector 3");
      setArea("Kusmunda Area");
      setCity("Korba");
      setState("Chhattisgarh");
      setPincode("495454");
      setCountry("India");
      setErrors({});
    }, 800);
  };

  const validate = () => {
    const newErrors = {};
    if (!houseNumber.trim()) {
      newErrors.houseNumber = "House / Flat number is required.";
    }
    if (!street.trim()) {
      newErrors.street = "Street / Locality is required.";
    }
    if (!city.trim()) {
      newErrors.city = "City is required.";
    }
    if (!state.trim()) {
      newErrors.state = "State is required.";
    }

    const cleanPincode = pincode.trim().replace(/\D/g, "");
    if (!cleanPincode || cleanPincode.length !== 6) {
      newErrors.pincode = "Enter a valid 6-digit Indian Pincode.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSaveAddress({
        houseNumber: houseNumber.trim(),
        building: building.trim(),
        street: street.trim(),
        locality: street.trim(),
        area: area.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: country.trim() || "India",
      });
    }, 600);
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
            <Text style={styles.headerTitle}>Edit Address</Text>
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveHeaderBtn}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#35C96B" />
              ) : (
                <Text style={styles.saveHeaderText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Quick Action: Use Current Location */}
            <TouchableOpacity
              style={styles.locationBanner}
              activeOpacity={0.8}
              onPress={handleUseCurrentLocation}
              disabled={isLocating}
            >
              <View style={styles.locationIconBox}>
                {isLocating ? (
                  <ActivityIndicator size="small" color="#35C96B" />
                ) : (
                  <Ionicons name="locate-outline" size={22} color="#35C96B" />
                )}
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationTitle}>Use Current Location</Text>
                <Text style={styles.locationSubtitle}>
                  Auto-fill address details using device GPS
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.sectionDividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR ENTER MANUALLY</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Form Fields */}
            <View style={styles.formGroup}>
              {/* House / Flat Number */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>House / Flat / Shop Number *</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.houseNumber ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={houseNumber}
                    onChangeText={(t) => {
                      setHouseNumber(t);
                      if (errors.houseNumber) setErrors({ ...errors, houseNumber: null });
                    }}
                    placeholder="e.g. House No. 24, Flat 3B"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                {errors.houseNumber ? (
                  <Text style={styles.errorText}>{errors.houseNumber}</Text>
                ) : null}
              </View>

              {/* Building / Apartment */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Building / Apartment Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={building}
                    onChangeText={setBuilding}
                    placeholder="e.g. Skyline Apartments"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* Street / Locality */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Street / Locality *</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.street ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={street}
                    onChangeText={(t) => {
                      setStreet(t);
                      if (errors.street) setErrors({ ...errors, street: null });
                    }}
                    placeholder="e.g. Street 5, Main Road"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                {errors.street ? (
                  <Text style={styles.errorText}>{errors.street}</Text>
                ) : null}
              </View>

              {/* Area / Landmark */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Area / Landmark</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={area}
                    onChangeText={setArea}
                    placeholder="e.g. Kusmunda, Near SBI Bank"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* City & State (Two column) */}
              <View style={styles.rowTwoCol}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.label}>City *</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.city ? styles.inputError : null,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={city}
                      onChangeText={(t) => {
                        setCity(t);
                        if (errors.city) setErrors({ ...errors, city: null });
                      }}
                      placeholder="e.g. Korba"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  {errors.city ? (
                    <Text style={styles.errorText}>{errors.city}</Text>
                  ) : null}
                </View>

                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.label}>State *</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.state ? styles.inputError : null,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={state}
                      onChangeText={(t) => {
                        setState(t);
                        if (errors.state) setErrors({ ...errors, state: null });
                      }}
                      placeholder="e.g. Chhattisgarh"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  {errors.state ? (
                    <Text style={styles.errorText}>{errors.state}</Text>
                  ) : null}
                </View>
              </View>

              {/* Pincode & Country (Two column) */}
              <View style={styles.rowTwoCol}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Pincode (6 digits) *</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.pincode ? styles.inputError : null,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={pincode}
                      onChangeText={(t) => {
                        setPincode(t);
                        if (errors.pincode) setErrors({ ...errors, pincode: null });
                      }}
                      placeholder="e.g. 495454"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                  {errors.pincode ? (
                    <Text style={styles.errorText}>{errors.pincode}</Text>
                  ) : null}
                </View>

                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Country</Text>
                  <View style={[styles.inputWrapper, styles.readOnlyInput]}>
                    <TextInput
                      style={styles.input}
                      value={country}
                      onChangeText={setCountry}
                      placeholder="India"
                      placeholderTextColor="#94A3B8"
                      editable={false}
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Fixed Save Button at bottom */}
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
                <Text style={styles.saveBtnText}>Save Address</Text>
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
  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  locationIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#166534",
  },
  locationSubtitle: {
    fontSize: 12,
    color: "#15803D",
    marginTop: 1,
  },
  sectionDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
  },
  formGroup: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  inputWrapper: {
    height: 50,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  readOnlyInput: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  input: {
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
  rowTwoCol: {
    flexDirection: "row",
    gap: 12,
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
