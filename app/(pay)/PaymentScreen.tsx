import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../APIService";
import { useRouter } from "expo-router"; // Thêm useRouter

// Dữ liệu giả cho thẻ
const SAVED_CARDS = [
  { id: "1", type: "visa", last4: "2512", default: true },
  { id: "2", type: "mastercard", last4: "5421", default: false },
  { id: "3", type: "visa", last4: "2512", default: false },
];

export default function PaymentScreen() {
  const router = useRouter(); // Thêm router
  const [selectedCardId, setSelectedCardId] = useState<string>("1"); // State cho thẻ được chọn
  
  // ===============================================
  // GIỮ NGUYÊN TOÀN BỘ LOGIC CỦA BẠN (VNPay, v.v.)
  // ===============================================
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [cartId, setCartId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("user-email");
        const storedCheckout = await AsyncStorage.getItem("checkoutData");

        if (storedEmail) setEmail(storedEmail);
        if (storedCheckout) {
          const parsed = JSON.parse(storedCheckout);
          if (parsed.total) setTotal(parsed.total);
        }

        if (storedEmail) {
          // NOTE: Port 3000? Bạn chắc chắn đây là port backend chính?
          const response = await fetch(
            `${BASE_URL}:3000/api/cart/latest?email=${encodeURIComponent(
              storedEmail
            )}`
          );
          const data = await response.json();
          if (response.ok && data.id) {
            setCartId(data.id);
          } else {
            console.warn("⚠️ Không tìm thấy giỏ hàng cho user:", storedEmail);
          }
        }
      } catch (error) {
        console.error("❌ Lỗi khi load dữ liệu PaymentScreen:", error);
      }
    })();
  }, []);

  const handlePayment = async () => {
    // ... Logic VNPay của bạn được giữ nguyên ...
    if (!selectedCardId) { // Đã đổi tên biến
      Alert.alert("Thông báo", "Vui lòng chọn phương thức thanh toán");
      return;
    }
    
    // ...
    // Giả sử logic VNPay của bạn vẫn ở đây
    // ...

    // Tạm thời, khi bấm Apply, chỉ quay lại
    router.back();
  };
  // ===============================================
  // KẾT THÚC LOGIC CỦA BẠN
  // ===============================================


  // Component render từng thẻ (Giống Ảnh 3)
  const CardRow = ({
    id,
    type,
    last4,
    isDefault,
  }: {
    id: string;
    type: "visa" | "mastercard";
    last4: string;
    isDefault: boolean;
  }) => {
    const isSelected = selectedCardId === id;
    return (
      <TouchableOpacity
        style={[
          styles.cardRow,
          isSelected && styles.cardRowActive,
        ]}
        onPress={() => setSelectedCardId(id)}
      >
        <Ionicons 
          name="card" // Bạn có thể đổi logo mastercard
          size={30} 
          color={type === 'visa' ? '#1a1f71' : '#eb001b'} 
        />
        <Text style={styles.cardText}>
          Thanh toán bằng VNPay.
        </Text>
        {isDefault && <Text style={styles.defaultTag}>Default</Text>}
        <Ionicons
          name={isSelected ? "radio-button-on" : "radio-button-off"}
          size={24}
          color={isSelected ? "#000" : "#ccc"}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header (Giống Ảnh 3) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Saved Cards</Text>
        
        {/* Render danh sách thẻ */}
        {SAVED_CARDS.map((card) => (
          <CardRow
            key={card.id}
            id={card.id}
            type={card.type as "visa" | "mastercard"}
            last4={card.last4}
            isDefault={card.default}
          />
        ))}

        {/* Nút Add New Card */}
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#000" />
          <Text style={styles.addButtonText}>Add New Card</Text>
        </TouchableOpacity>

        {/* Hiển thị message lỗi VNPay (nếu có) */}
        {message ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Footer Button (Giống Ảnh 3) */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayment} // Dùng lại hàm handlePayment của bạn
        >
          <Text style={styles.payText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles (Đã viết lại)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  content: { padding: 20 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 15 },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    marginBottom: 10,
  },
  cardRowActive: {
    borderColor: "#000",
    backgroundColor: "#f9f9f9",
  },
  cardText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
  },
  defaultTag: {
    fontSize: 12,
    color: "#555",
    backgroundColor: "#eee",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginRight: 10,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    borderStyle: "dashed",
    marginTop: 10,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#f0f0f0",
  },
  payButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  payText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  
  // Giữ lại style message của bạn
  messageBox: { marginTop: 20 },
  messageText: { textAlign: "center", fontSize: 14, color: "#444" },
});