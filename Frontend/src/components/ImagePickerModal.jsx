import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function ImagePickerModal({
  visible,
  onClose,
  onImageSelected,
  onRemovePhoto,
  hasImage,
}) {
  const pickImageFromGallery = async () => {
    onClose();
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo gallery to select a profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Gallery picker error:", error);
      Alert.alert("Error", "Could not pick image from gallery.");
    }
  };

  const takePhotoWithCamera = async () => {
    onClose();
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow camera access to take a profile photo."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Could not take photo.");
    }
  };

  const handleRemove = () => {
    onClose();
    onRemovePhoto();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Profile Photo</Text>
          <Text style={styles.sheetSubtitle}>{"Choose how you'd like to update your avatar"}</Text>

          <View style={styles.optionsList}>
            <TouchableOpacity
              style={styles.optionRow}
              activeOpacity={0.7}
              onPress={pickImageFromGallery}
            >
              <View style={[styles.iconBox, { backgroundColor: "#F0FDF4" }]}>
                <Ionicons name="images-outline" size={22} color="#35C96B" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Choose from Gallery</Text>
                <Text style={styles.optionSubtitle}>Select existing photo from device</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              activeOpacity={0.7}
              onPress={takePhotoWithCamera}
            >
              <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="camera-outline" size={22} color="#3B82F6" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Take Photo</Text>
                <Text style={styles.optionSubtitle}>Use camera to capture new avatar</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {hasImage && (
              <TouchableOpacity
                style={[styles.optionRow, styles.removeRow]}
                activeOpacity={0.7}
                onPress={handleRemove}
              >
                <View style={[styles.iconBox, { backgroundColor: "#FEF2F2" }]}>
                  <Ionicons name="trash-outline" size={22} color="#EF4444" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: "#EF4444" }]}>
                    Remove Photo
                  </Text>
                  <Text style={styles.optionSubtitle}>Revert to default initials avatar</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.7}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#CBD5E1",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 20,
  },
  optionsList: {
    gap: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  removeRow: {
    backgroundColor: "#FFF5F5",
    borderColor: "#FEE2E2",
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  optionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  cancelButton: {
    marginTop: 16,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },
});
