import React, { useState } from "react"; 
import {
 View,
 Text,
 StyleSheet,
 TouchableOpacity,
 ScrollView,
 Modal, 
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
// import GeminiAssistant from "../../components/GeminiAssistant"; // <<<< 1. ĐÃ XÓA
import AsyncStorage from "@react-native-async-storage/async-storage";

// ... (danh sách accountOptions)
const accountOptions = [
 { id: "1", title: "My Orders", icon: "cube-outline", route: "/order" }, 
 { id: "2", title: "My Details", icon: "person-outline", route: "/placeholder" },
 { id: "3", title: "Address Book", icon: "home-outline", route: "/address" },
 { id: "4", title: "Payment Methods", icon: "card-outline", route: "/placeholder" },
 { id: "8", title: "Change Password", icon: "lock-closed-outline", route: "/change-password"},
 { id: "5", title: "Notifications", icon: "notifications-outline", route: "/placeholder" },
 { id: "6", title: "FAQs", icon: "help-circle-outline", route: "/placeholder" },
 { id: "7", title: "Help Center", icon: "headset-outline", route: "/placeholder" },
];

// 1. Định nghĩa kiểu dữ liệu cho props của Modal
type LogoutModalProps = {
 visible: boolean;
 onLogout: () => void;
 onCancel: () => void;
};

// 2. Áp dụng kiểu dữ liệu vào component
const LogoutModal = ({ visible, onLogout, onCancel }: LogoutModalProps) => {
 return (
  <Modal visible={visible} transparent={true} animationType="fade">
   <View style={styles.modalBackdrop}>
    <View style={styles.modalContainer}>
     <Ionicons name="alert-circle-outline" size={80} color="#dc3545" />
     <Text style={styles.modalTitle}>Logout?</Text>
     <Text style={styles.modalSubtitle}>
      Are you sure you want to logout?
     </Text>

     <TouchableOpacity style={styles.modalButtonYes} onPress={onLogout}>
      <Text style={styles.modalButtonTextYes}>Yes, Logout</Text>
     </TouchableOpacity>
     <TouchableOpacity style={styles.modalButtonCancel} onPress={onCancel}>
      <Text style={styles.modalButtonTextCancel}>No, Cancel</Text>
     </TouchableOpacity>
    </View>
   </View>
  </Modal>
 );
};

export default function AccountScreen() {
 const router = useRouter();
 
 // 4. Thêm state cho modal
 const [showLogoutModal, setShowLogoutModal] = useState(false);

 // 5. Sửa hàm handleLogout (giờ chỉ mở modal)
 const handleLogout = () => {
  setShowLogoutModal(true);
 };

 // 6. Thêm hàm xác nhận logout
 const confirmLogout = async () => {
  // Xóa tất cả dữ liệu đã lưu
  await AsyncStorage.removeItem("jwt-token");
  await AsyncStorage.removeItem("user-email");
  await AsyncStorage.removeItem("cart-id");
  await AsyncStorage.removeItem("userId");

  // Đóng modal
  setShowLogoutModal(false);

  // Điều hướng về login
  router.replace("/login");
 };

 return (
  <View style={styles.container}>
   {/* 7. Thêm Modal vào giao diện */}
   <LogoutModal
    visible={showLogoutModal}
    onLogout={confirmLogout}
    onCancel={() => setShowLogoutModal(false)}
   />

   {/* Header (giữ nguyên) */}
   <View style={styles.header}>
    <TouchableOpacity onPress={() => router.back()}>
     <Ionicons name="arrow-back" size={24} color="#000" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Account</Text>
    <TouchableOpacity>
     <Ionicons name="notifications-outline" size={24} color="#000" />
    </TouchableOpacity>
   </View>

   <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
    
    {/* 2. ĐÃ XÓA GeminiAssistant */}

    {/* Danh sách các tùy chọn (giữ nguyên) */}
    {accountOptions.map((item) => (
     <TouchableOpacity
      key={item.id}
      style={styles.row}
      onPress={() => router.push(item.route as any)}
     >
      <View style={styles.rowLeft}>
       <Ionicons name={item.icon} size={22} color="#000" />
       <Text style={styles.rowText}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#aaa" />
     </TouchableOpacity>
    ))}

    {/* Logout (giữ nguyên) */}
    {/* 'onPress' đã được sửa để gọi hàm handleLogout mới */}
    <TouchableOpacity style={styles.row} onPress={handleLogout}>
     <View style={styles.rowLeft}>
      <Ionicons name="log-out-outline" size={22} color="red" />
      <Text style={[styles.rowText, { color: "red" }]}>Logout</Text>
     </View>
    </TouchableOpacity>
   </ScrollView>
  </View>
 );
}

// Giữ nguyên styles của bạn
const styles = StyleSheet.create({
 container: { flex: 1, backgroundColor: "#fff" },
 header: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 15,
  borderBottomWidth: 1,
  borderColor: "#eee",
  backgroundColor: "#fff",
 },
 headerTitle: { fontSize: 16, fontWeight: "600" },
 row: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: 16,
  paddingHorizontal: 15,
  borderBottomWidth: 1,
  borderColor: "#f0f0f0",
 },
 rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
 rowText: { fontSize: 15, fontWeight: "500" },

 modalBackdrop: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
 },
 modalContainer: {
  width: "80%",
  backgroundColor: "#fff",
  borderRadius: 20,
  padding: 25,
  alignItems: "center",
 },
 modalTitle: {
  fontSize: 22,
  fontWeight: "600",
  marginTop: 15,
  marginBottom: 5,
 },
 modalSubtitle: {
  fontSize: 14,
  color: "#666",
  textAlign: "center",
  marginBottom: 20,
 },
 modalButtonYes: {
  backgroundColor: "#dc3545", // Màu đỏ
  borderRadius: 10,
  paddingVertical: 12,
  width: "100%",
  alignItems: "center",
  marginBottom: 10,
 },
 modalButtonTextYes: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "600",
 },
 modalButtonCancel: {
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 10,
  paddingVertical: 12,
  width: "100%",
  alignItems: "center",
 },
 modalButtonTextCancel: {
  color: "#000",
  fontSize: 16,
  fontWeight: "600",
 },
});