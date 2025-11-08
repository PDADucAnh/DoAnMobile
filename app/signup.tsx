import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { POST_ADD } from "../APIService";
import Ionicons from "@expo/vector-icons/Ionicons";
import { isAxiosError } from "axios";

// Regex (Biểu thức chính quy)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-Z\s]{5,}$/; // Ít nhất 5 ký tự, chỉ chữ
const MOBILE_REGEX = /^0\d{9}$/; // Bắt đầu bằng 0, tổng 10 chữ số

export default function SignupScreen() {
  const router = useRouter();

  // States cho form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // States cho xác thực (validation)
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  // ===================================
  // BẮT ĐẦU SỬA LOGIC
  // ===================================

  // 1. Sửa hàm validate để kiểm tra từng trường một
  const validateField = (field: string, value: string) => {
    let error: string | null = null;

    switch (field) {
      case "firstName":
        if (!value.trim()) error = "First Name is required.";
        else if (!NAME_REGEX.test(value)) error = "Must be at least 5 letters.";
        break;
      case "lastName":
        if (!value.trim()) error = "Last Name is required.";
        else if (!NAME_REGEX.test(value)) error = "Must be at least 5 letters.";
        break;
      case "mobileNumber":
        if (!value.trim()) error = "Mobile Number is required.";
        else if (!MOBILE_REGEX.test(value))
          error = "Must be 10 digits and start with 0.";
        break;
      case "email":
        if (!value.trim()) error = "Email is required.";
        else if (!EMAIL_REGEX.test(value))
          error = "Please enter a valid email address.";
        break;
      case "password":
        if (!value.trim()) error = "Password is required.";
        else if (value.length < 6)
          error = "Password must be at least 6 characters.";

        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === null;
  };

  // 2. Hàm validateAll để kiểm tra khi submit
  const validateAll = () => {
    const v1 = validateField("firstName", firstName);
    const v2 = validateField("lastName", lastName);
    const v3 = validateField("mobileNumber", mobileNumber);
    const v4 = validateField("email", email);
    const v5 = validateField("password", password);
    return v1 && v2 && v3 && v4 && v5;
  };

  // 3. Hàm 'touch' và 'validate' khi onBlur
  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };
  // ===================================
  // KẾT THÚC SỬA LOGIC
  // ===================================

  const handleSignup = async () => {
    // 1. Đánh dấu tất cả là "đã chạm"
    setTouched({
      firstName: true,
      lastName: true,
      mobileNumber: true,
      email: true,
      password: true,
    });

    // 2. Chạy xác thực
    if (!validateAll()) {
      // Sửa: Dùng validateAll
      return; // Dừng nếu validation thất bại
    }

    setLoading(true);


    // 3. Sửa lại đối tượng 'address' để gửi dữ liệu giả hợp lệ
    //    thay vì "N/A"
    const newUser = {
      firstName,
      lastName,
      mobileNumber,
      email,
      password,
      address: {
        street: "123 Duong Pho", // Giả lập
        buildingName: "Toa Nha A", // Giả lập
        city: "Hanoi", // Giả lập
        state: "Hanoi", // Giả lập
        country: "Vietnam", // Giả lập
        pincode: "100000", // Giả lập (Pincode hợp lệ, 6 chữ số)
      },
    };

    try {
      const response = await POST_ADD("register", newUser);
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", "Account created successfully!");
        router.push("/login");
      } else {
        throw new Error("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      let message = "Could not connect to server.";
      if (isAxiosError(error)) {
        // Lỗi từ backend (ví dụ: Email đã tồn tại)
        message = error.response?.data?.message || "Registration failed.";
        // Hiển thị lỗi API cho ô email
        setErrors((prev) => ({ ...prev, email: message }));
      } else if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  // Điều hướng đến trang placeholder
  const goToPlaceholder = () => {
    router.push("/placeholder");
  };

  // Hàm lấy style viền (giống login)
  const getBorderStyle = (field: string) => {
    if (errors[field] && touched[field]) return styles.inputError;
    if (!errors[field] && touched[field]) return styles.inputSuccess;
    return styles.inputContainer;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>Let&apos;s create your account.</Text>

        {/* First Name */}
        <Text style={styles.label}>First Name</Text>
        <View style={getBorderStyle("firstName")}>
          <Ionicons name="person-outline" size={22} color="#888" />
          <TextInput
            style={styles.input}
            placeholder="Enter your first name"
            placeholderTextColor="#888"
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              if (touched.firstName) validateField("firstName", text);
            }}
            onBlur={() => handleBlur("firstName", firstName)} // Sửa onBlur
            autoCapitalize="words"
          />
          {/* Sửa logic hiển thị icon */}
          {!errors.firstName && touched.firstName && firstName.length > 0 && (
            <Ionicons name="checkmark-circle" size={22} color="#28a745" />
          )}
        </View>
        {errors.firstName && touched.firstName && (
          <Text style={styles.errorText}>{errors.firstName}</Text>
        )}

        {/* Last Name */}
        <Text style={styles.label}>Last Name</Text>
        <View style={getBorderStyle("lastName")}>
          <Ionicons name="person-outline" size={22} color="#888" />
          <TextInput
            style={styles.input}
            placeholder="Enter your last name"
            placeholderTextColor="#888"
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              if (touched.lastName) validateField("lastName", text);
            }}
            onBlur={() => handleBlur("lastName", lastName)} // Sửa onBlur
            autoCapitalize="words"
          />
          {!errors.lastName && touched.lastName && lastName.length > 0 && (
            <Ionicons name="checkmark-circle" size={22} color="#28a745" />
          )}
        </View>
        {errors.lastName && touched.lastName && (
          <Text style={styles.errorText}>{errors.lastName}</Text>
        )}

        {/* Mobile Number */}
        <Text style={styles.label}>Mobile Number</Text>
        <View style={getBorderStyle("mobileNumber")}>
          <Ionicons name="call-outline" size={22} color="#888" />
          <TextInput
            style={styles.input}
            placeholder="Starts with 0 (10 digits)"
            placeholderTextColor="#888"
            value={mobileNumber}
            onChangeText={(text) => {
              setMobileNumber(text);
              if (touched.mobileNumber) validateField("mobileNumber", text);
            }}
            onBlur={() => handleBlur("mobileNumber", mobileNumber)} // Sửa onBlur
            keyboardType="phone-pad"
            maxLength={10}
          />
          {!errors.mobileNumber &&
            touched.mobileNumber &&
            mobileNumber.length > 0 && (
              <Ionicons name="checkmark-circle" size={22} color="#28a745" />
            )}
        </View>
        {errors.mobileNumber && touched.mobileNumber && (
          <Text style={styles.errorText}>{errors.mobileNumber}</Text>
        )}

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <View style={getBorderStyle("email")}>
          <Ionicons name="mail-outline" size={22} color="#888" />
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            placeholderTextColor="#888"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (touched.email) validateField("email", text);
            }}
            onBlur={() => handleBlur("email", email)} // Sửa onBlur
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {!errors.email && touched.email && email.length > 0 && (
            <Ionicons name="checkmark-circle" size={22} color="#28a745" />
          )}
        </View>
        {errors.email && touched.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={getBorderStyle("password")}>
          <Ionicons name="lock-closed-outline" size={22} color="#888" />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (touched.password) validateField("password", text);
            }}
            onBlur={() => handleBlur("password", password)} // Sửa onBlur
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        {errors.password && touched.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        {/* ... (Phần còn lại: Terms, Button, Social, Login link giữ nguyên) ... */}
        <Text style={styles.termsText}>
          By signing up you agree to our <Text style={styles.link}>Terms</Text>,{" "}
          <Text style={styles.link}>Privacy Policy</Text>, and{" "}
          <Text style={styles.link}>Cookie Use</Text>.
        </Text>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create an Account</Text>
          )}
        </TouchableOpacity>

        {/* Or sign up with */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or sign up with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={goToPlaceholder} // Chuyển đến trang placeholder
        >
          <Ionicons name="logo-google" size={22} color="#000" />
          <Text style={styles.socialButtonText}>Sign Up with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={goToPlaceholder} // Chuyển đến trang placeholder
        >
          <Ionicons name="logo-facebook" size={22} color="#1877F2" />
          <Text style={styles.socialButtonText}>Sign Up with Facebook</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Log In Link */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.signupLink}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles (Dựa trên file login.tsx và ảnh)
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
    marginTop: 10,
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
    borderColor: "#dc3545", // Màu đỏ
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  inputSuccess: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6fff8",
    borderWidth: 1,
    borderColor: "#28a745", // Màu xanh
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
    paddingLeft: 5,
  },
  termsText: {
    fontSize: 13,
    color: "#666",
    marginVertical: 15,
    lineHeight: 20,
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
