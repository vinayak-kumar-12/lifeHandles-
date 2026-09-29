import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function VerifyOtpScreen() {
  const params = useLocalSearchParams();
  const userEmail = params.email || "";
  const { verifyOTP, resendOTP } = useAuth();

  const OTP_LENGTH = 6;
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(582); // 09:42 start
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = useRef([]);
  const [fadeAnim] = useState(() => new Animated.Value(1));
  const [slideAnim] = useState(() => new Animated.Value(18));
  const [buttonScale] = useState(() => new Animated.Value(1));

  // Entrance 60fps Fade + Slide animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-focus first digit input
    const timer = setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim]);

  // Countdown timer effect
  useEffect(() => {
    if (timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerSeconds]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const padMins = mins < 10 ? `0${mins}` : mins;
    const padSecs = secs < 10 ? `0${secs}` : secs;
    return `${padMins}:${padSecs}`;
  };

  const handleOtpChange = (text, index) => {
    setErrorMessage("");
    setInfoMessage("");

    // Support full OTP paste (e.g. "123456")
    const cleanedText = text.replace(/[^0-9]/g, "");
    if (cleanedText.length > 1) {
      const pastedOtp = cleanedText.slice(0, OTP_LENGTH).split("");
      const newOtp = [...otp];
      pastedOtp.forEach((char, idx) => {
        newOtp[idx] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pastedOtp.length, OTP_LENGTH - 1);
      setFocusedIndex(nextIndex);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      return;
    }

    // Single digit input
    const newOtp = [...otp];
    newOtp[index] = cleanedText;
    setOtp(newOtp);

    // Auto advance focus to next input box
    if (cleanedText !== "" && index < OTP_LENGTH - 1) {
      setFocusedIndex(index + 1);
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    // Auto move back when backspacing empty field
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      setFocusedIndex(index - 1);
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  const onPressInButton = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const onPressOutButton = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handleVerify = async () => {
    if (!isOtpComplete || isLoading) return;

    setErrorMessage("");
    setInfoMessage("");

    const fullCode = otp.join("");
    setIsLoading(true);
    try {
      await verifyOTP(userEmail, fullCode);
      router.replace({ pathname: "/login", params: { email: userEmail, verified: "true" } });
    } catch (err) {
      setErrorMessage(err.message || "Invalid OTP. Please check and try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      setFocusedIndex(0);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    setOtp(Array(OTP_LENGTH).fill(""));
    setErrorMessage("");
    setTimerSeconds(60);
    setCanResend(false);
    setFocusedIndex(0);
    if (inputRefs.current[0]) inputRefs.current[0].focus();
    try {
      await resendOTP(userEmail);
      setInfoMessage("A new 6-digit code has been sent to your email.");
    } catch (err) {
      setInfoMessage(err.message || "Failed to resend OTP. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Animated.View
        style={[
          styles.animatedWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardContainer}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. BRAND HEADER */}
            <View style={styles.brandHeader}>
              <TouchableOpacity
                style={styles.logoBadge}
                activeOpacity={0.85}
                onPress={() => router.push("/")}
              >
                <Text style={styles.emoji}>🏠</Text>
              </TouchableOpacity>
              <Text style={styles.brandTitle}>
                Padosi<Text style={styles.brandHighlight}>Pro</Text>
              </Text>
            </View>

            {/* 2. OTP HEADER */}
            <View style={styles.otpHeaderSection}>
              <Text style={styles.heading}>Verify your email</Text>
              <Text style={styles.subheading}>
                We’ve sent a 6-digit verification code to
              </Text>
              <Text style={styles.emailHighlight}>{userEmail}</Text>
            </View>

            {/* ERROR / SUCCESS NOTIFICATION BANNERS */}
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            ) : null}

            {infoMessage ? (
              <View style={styles.infoBanner}>
                <Text style={styles.infoBannerText}>{infoMessage}</Text>
              </View>
            ) : null}

            {/* 3. OTP INPUT BOXES */}
            <View style={styles.otpRowContainer}>
              {otp.map((digit, index) => {
                const isFocused = focusedIndex === index;
                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      isFocused && styles.otpBoxFocused,
                      digit !== "" && styles.otpBoxFilled,
                    ]}
                  >
                    <TextInput
                      ref={(ref) => (inputRefs.current[index] = ref)}
                      style={styles.otpInputText}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      onFocus={() => setFocusedIndex(index)}
                      keyboardType="number-pad"
                      maxLength={6}
                      selectTextOnFocus
                      contextMenuHidden={false}
                    />
                  </View>
                );
              })}
            </View>

            {/* 4. TIMER / RESEND */}
            <View style={styles.timerContainer}>
              {!canResend ? (
                <Text style={styles.timerText}>
                  Code expires in{" "}
                  <Text style={styles.timerValue}>
                    {formatTimer(timerSeconds)}
                  </Text>
                </Text>
              ) : (
                <View style={styles.resendRow}>
                  <Text style={styles.resendQuestionText}>
                    Didn’t receive the code?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={handleResendCode}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resendActionText}>Resend code</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 5. VERIFY BUTTON */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (!isOtpComplete || isLoading) && styles.verifyButtonDisabled,
                ]}
                activeOpacity={0.88}
                onPressIn={onPressInButton}
                onPressOut={onPressOutButton}
                onPress={handleVerify}
                disabled={!isOtpComplete || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* 7. BACK ACTION */}
            <View style={styles.backContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Text style={styles.backButtonText}>← Change email</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  animatedWrapper: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    justifyContent: "center",
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#35C96B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emoji: {
    fontSize: 28,
    lineHeight: 34,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.6,
  },
  brandHighlight: {
    color: "#35C96B",
  },
  otpHeaderSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.6,
    marginBottom: 8,
    textAlign: "center",
  },
  subheading: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },
  emailHighlight: {
    fontSize: 15,
    fontWeight: "700",
    color: "#35C96B",
    marginTop: 4,
    textAlign: "center",
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  errorBannerText: {
    color: "#991B1B",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  infoBanner: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#35C96B",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  infoBannerText: {
    color: "#166534",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  otpRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  otpBoxFocused: {
    borderColor: "#35C96B",
    backgroundColor: "#F0FDF4",
  },
  otpBoxFilled: {
    borderColor: "#35C96B",
  },
  otpInputText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    width: "100%",
    height: "100%",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  timerText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  timerValue: {
    fontWeight: "700",
    color: "#0F172A",
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  resendQuestionText: {
    fontSize: 14,
    color: "#64748B",
  },
  resendActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#35C96B",
  },
  verifyButton: {
    backgroundColor: "#35C96B",
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  verifyButtonDisabled: {
    opacity: 0.55,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  backContainer: {
    alignItems: "center",
    marginTop: 32,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
});
