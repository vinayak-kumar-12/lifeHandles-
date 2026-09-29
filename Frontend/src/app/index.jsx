import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function SplashScreen() {
  const [fadeAnim] = useState(() => new Animated.Value(1));
  const hasNavigatedRef = useRef(false);
  const { isAuthenticated, isLoading } = useAuth();

  const startTransition = useCallback(() => {
    if (hasNavigatedRef.current || isLoading) return;
    hasNavigatedRef.current = true;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 450,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    setTimeout(() => {
      if (isAuthenticated) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    }, 450);
  }, [fadeAnim, isAuthenticated, isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      startTransition();
    }, 1800);

    return () => clearTimeout(timer);
  }, [isLoading, startTransition]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <TouchableOpacity
        style={styles.touchableArea}
        activeOpacity={1}
        onPress={startTransition}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.logoContainer}>
            <Text style={styles.emoji}>🏠</Text>
          </View>

          <Text style={styles.title}>
            Padosi<Text style={styles.titleHighlight}>Pro</Text>
          </Text>

          <Text style={styles.tagline}>Your lifestyle, handled.</Text>

          {isLoading && (
            <View style={{ marginTop: 24 }}>
              <ActivityIndicator size="small" color="#35C96B" />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  touchableArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#35C96B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emoji: {
    fontSize: 44,
    lineHeight: 52,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  titleHighlight: {
    color: "#35C96B",
  },
  tagline: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 10,
    letterSpacing: 0.2,
    textAlign: "center",
  },
});
