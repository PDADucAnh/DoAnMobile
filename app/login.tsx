import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { POST_LOGIN, GET_ID } from "../APIService";
import { useUser } from "./UserContext";
import { isAxiosError } from "axios";
import Ionicons from "@expo/vector-icons/Ionicons"; // Thêm Ionicons

// Regex để kiểm tra email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // State mới cho UI
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Hàm xác thực (validate)
  const validateEmail = (text: string) => {
    if (!text.trim()) {
      setEmailError("Email is required.");
      return false;
    } else if (!EMAIL_REGEX.test(text)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (text: string) => {
    if (!text.trim()) {
      setPasswordError("Password is required.");
      return false;
    } else if (text.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleLogin = async () => {
    // 1. Chạm vào 2 ô (để hiển thị lỗi nếu có)
    setEmailTouched(true);
    setPasswordTouched(true);

    // 2. Chạy xác thực lần cuối
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return; // Dừng lại nếu frontend validation thất bại
    }

    setLoading(true);

    try {
      // 3. Giữ nguyên logic gọi API của bạn
      const isLoggedIn = await POST_LOGIN(email, password);

      if (isLoggedIn) {
        const token = await AsyncStorage.getItem("jwt-token");
        const userResponse = await GET_ID(
          "public/users/email",
          encodeURIComponent(email)
        );
        await login(userResponse.data, token ?? undefined);
        router.replace("/(tabs)/(home)");
      } else {
        // Lỗi này không bao giờ nên xảy ra nếu API trả về 401, nhưng vẫn giữ
        throw new Error("Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      let message = "Invalid email or password."; // Mặc định

      if (isAxiosError(error)) {
        message =
          error.response?.data?.message || "Server error, please try again.";
      } else if (error instanceof Error) {
        message = error.message;
      }

      // Hiển thị lỗi API cho cả 2 ô
      setEmailError(message);
      setPasswordError(" "); // Thêm 1 khoảng trắng để kích hoạt viền đỏ
    } finally {
      setLoading(false);
    }
  };

  // Các hàm điều hướng đến trang placeholder
  const goToPlaceholder = () => {
    router.push("/placeholder");
  };

  // Tính toán trạng thái viền (border)
  const getEmailBorderStyle = () => {
    if (emailError && emailTouched) return styles.inputError;
    if (!emailError && emailTouched && email.length > 0)
      return styles.inputSuccess;
    return styles.inputContainer;
  };

  const getPasswordBorderStyle = () => {
    if (passwordError && passwordTouched) return styles.inputError;
    if (!passwordError && passwordTouched && password.length > 0)
      return styles.inputSuccess;
    return styles.inputContainer;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Login to your account.</Text>
        <Text style={styles.subtitle}>
          Welcome back, please enter your details.
        </Text>

        {/* Email Input */}
        <Text style={styles.label}>Email</Text>
        <View style={getEmailBorderStyle()}>
          <Ionicons name="mail-outline" size={22} color="#888" />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailTouched) validateEmail(text);
            }}
            onBlur={() => {
              setEmailTouched(true);
              validateEmail(email);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {!emailError && emailTouched && email.length > 0 && (
            <Ionicons name="checkmark-circle" size={22} color="#28a745" />
          )}
        </View>
        {emailError && emailTouched && (
          <Text style={styles.errorText}>{emailError}</Text>
        )}

        {/* Password Input */}
        <Text style={styles.label}>Password</Text>
        <View style={getPasswordBorderStyle()}>
          <Ionicons name="lock-closed-outline" size={22} color="#888" />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordTouched) validatePassword(text);
            }}
            onBlur={() => {
              setPasswordTouched(true);
              validatePassword(password);
            }}
            secureTextEntry={!showPassword} // Ẩn/hiện mật khẩu
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        {passwordError && passwordTouched && (
          <Text style={styles.errorText}>{passwordError}</Text>
        )}

        {/* Forgot Password */}
        <TouchableOpacity
          style={styles.forgotButton}
          onPress={goToPlaceholder} // Chuyển đến trang placeholder
        >
          <Text style={styles.link}>Forgot your password? </Text>
          <Text style={[styles.link, { fontWeight: "600" }]}>
            Reset your password
          </Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Or login with */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or login with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={goToPlaceholder} // Chuyển đến trang placeholder
        >
          <Ionicons name="logo-google" size={22} color="#000" />
          <Text style={styles.socialButtonText}>Login with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={goToPlaceholder} // Chuyển đến trang placeholder
        >
          <Ionicons name="logo-facebook" size={22} color="#1877F2" />
          <Text style={styles.socialButtonText}>Login with Facebook</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Sign Up Link */}
      <View style={styles.signupContainer}>
        {/* <<<<<< SỬA LỖI 1: ' (dấu nháy đơn) */}
        <Text style={styles.signupText}>Don&apos;t have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles mới dựa trên Ảnh 1, 2, 3
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  inputError: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff6f6",
    borderWidth: 1,
    borderColor: "#dc3545", // Màu đỏ (Ảnh 2)
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  inputSuccess: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6fff8",
    borderWidth: 1,
    borderColor: "#28a745", // Màu xanh (Ảnh 3)
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  errorText: {
    color: "#dc3545", // Màu đỏ
    fontSize: 13,
    marginBottom: 10,
    paddingLeft: 5,
  },
  forgotButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginVertical: 10,
  },
  link: {
    color: "#007BFF",
  },
  button: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#eee",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#888",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 10,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  signupText: {
    fontSize: 14,
    color: "#666",
  },
  signupLink: {
    fontSize: 14,
    color: "#007BFF",
    fontWeight: "600",
  },
});
