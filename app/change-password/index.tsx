import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GET_ID, PUT_EDIT } from "../../APIService"; // Import 2 hàm API

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSavePassword = async () => {
    setError(""); // Xóa lỗi cũ
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      // 1. Lấy email và userId từ lúc đăng nhập
      const email = await AsyncStorage.getItem("user-email");
      const userId = await AsyncStorage.getItem("userId"); // Giả sử bạn đã lưu userId khi login
      
      if (!email || !userId) {
        throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      }

      // 2. Lấy toàn bộ thông tin user hiện tại
      // (Vì API PUT /users/{id} yêu cầu toàn bộ DTO)
      const response = await GET_ID(`public/users/email`, email);
      const currentUserDTO = response.data;

      // 3. Tạo DTO mới, chỉ cập nhật mật khẩu
      const updatedUserDTO = {
        ...currentUserDTO,
        password: newPassword, // Cập nhật mật khẩu mới
      };

      // 4. Gửi lại toàn bộ DTO
      await PUT_EDIT(`public/users/${userId}`, updatedUserDTO);

      setLoading(false);
      Alert.alert("Thành công", "Mật khẩu của bạn đã được cập nhật.");
      router.back();

    } catch (err: any) {
      setLoading(false);
      console.error("Lỗi khi đổi mật khẩu:", err);
      setError(err.message || "Đã xảy ra lỗi, vui lòng thử lại.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi Mật Khẩu</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.warningTitle}>Cảnh báo bảo mật</Text>
        <Text style={styles.warningText}>
          Chức năng này không yêu cầu mật khẩu cũ. Bất kỳ ai có quyền truy cập
          vào điện thoại của bạn đều có thể đặt lại mật khẩu.
        </Text>
        
        {/* New Password */}
        <Text style={styles.label}>Mật khẩu mới</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        {/* Confirm Password */}
        <Text style={styles.label}>Xác nhận mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu mới"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* Nút lưu */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSavePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Lưu mật khẩu</Text>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  content: {
    padding: 20,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D9534F",
  },
  warningText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    backgroundColor: "#fef7f7",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#f2dede"
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 30,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 15,
  },
});