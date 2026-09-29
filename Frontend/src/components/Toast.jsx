import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Toast({ message, type = "success", visible, onDismiss }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!visible) {
      translateY.setValue(-100);
      opacity.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismissRef.current?.();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [visible, opacity, translateY]);

  if (!visible) return null;

  const isSuccess = type === "success";

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        isSuccess ? styles.toastSuccess : styles.toastError,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Ionicons
        name={isSuccess ? "checkmark-circle" : "alert-circle"}
        size={20}
        color={isSuccess ? "#15803D" : "#B91C1C"}
      />
      <Text style={[styles.toastText, isSuccess ? styles.textSuccess : styles.textError]}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 54,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    gap: 10,
  },
  toastSuccess: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  toastError: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  toastText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  textSuccess: {
    color: "#166534",
  },
  textError: {
    color: "#991B1B",
  },
});
