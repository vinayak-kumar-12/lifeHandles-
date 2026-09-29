import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TaskProvider } from "../context/TaskContext";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <AuthProvider>
        <TaskProvider>
          <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "fade",
                contentStyle: { backgroundColor: "#FFFFFF" },
              }}
            />
          </View>
        </TaskProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
