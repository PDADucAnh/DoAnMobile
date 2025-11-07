import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert, // Sửa lại Alert
} from "react-native";
import { BASE_URL } from "../../APIService"; // Dùng IP cứng cho backend Node.js

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [message, setMessage] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [corporateInvoice, setCorporateInvoice] = useState(false);
  const [totalVND, setTotalVND] = useState(0);

  useEffect(() => {
    // Logic này lấy 'total' từ trang trước
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const vnpCode = url.searchParams.get("vnp_ResponseCode");
      const amountParam = url.searchParams.get("amount");
      const status = url.searchParams.get("status");

      let totalAmount = 0;
      if (amountParam) {
        totalAmount = parseFloat(amountParam);
      } else if (params.total) {
        totalAmount = parseFloat(params.total as string);
      }
      setTotalVND(totalAmount);

      if (vnpCode === "00" || status === "success") {
        setMessage("Thanh toán thành công!");
      } else if (vnpCode) {
        setMessage("Thanh toán thất bại!");
      }
    } else if (params.total) {
      // Dành cho mobile, chỉ lấy total
      setTotalVND(parseFloat(params.total as string));
    }
  }, [params.total]);


  const handlePayment = async () => {
    if (!selectedPayment) {
      setMessage("Vui lòng chọn phương thức thanh toán");
      return;
    }
    if (!agreeTerms) {
      setMessage("Vui lòng đồng ý với điều khoản");
      return;
    }
    if (selectedPayment !== "vnpay") {
      Alert.alert("Thông báo", "Chức năng này đang được hoàn thiện.");
      setMessage("Chỉ demo VNPay trong flow này.");
      return;
    }

    try {
      const email = await AsyncStorage.getItem("user-email");
      if (!email) {
        setMessage("Không tìm thấy email người dùng, vui lòng đăng nhập lại.");
        return;
      }

      const cartId = await AsyncStorage.getItem("cart-id"); 
      if (!cartId) {
        setMessage("Không tìm thấy giỏ hàng của bạn.");
        return;
      }

      // Kiểm tra lại lỗi Amount: 0
      if (totalVND <= 0) {
        setMessage("Số tiền thanh toán phải lớn hơn 0.");
        return;
      }

      console.log(" Sending create_payment with amount:", totalVND, { email, cartId });

      // ===================================
      // SỬA LỖI MẠNG VÀ PHƯƠNG THỨC
      // ===================================

      // 1. Sửa IP thành IP của bạn
      // 2. Sửa port thành 3000 (Node.js)
      // 3. Dùng 'fetch' (mặc định là GET) vì server.js dùng app.get()
      const paymentUrl = `${BASE_URL}:3000/create_payment?email=${encodeURIComponent(email)}&cartId=${encodeURIComponent(cartId)}&amount=${encodeURIComponent(totalVND)}`;
      
      const resp = await fetch(paymentUrl); 
      // KHÔNG CẦN method: 'POST' hay body

      // ===================================
      // KẾT THÚC SỬA LỖI
      // ===================================

      const json = await resp.json();
      console.log("🔸 create_payment response:", json);

      if (!resp.ok) {
        setMessage("Server trả lỗi: " + (json?.error || resp.status));
        return;
      }

      if (!json.url) {
        setMessage("Không nhận được link thanh toán từ server");
        return;
      }

      // 4. Redirect sang VNPay
      if (Platform.OS === "web") {
        window.location.href = json.url;
      } else {
        Alert.alert("Thông báo", "Thanh toán VNPay chỉ hỗ trợ trên nền tảng web trong demo này.");
        setMessage("Thanh toán VNPay chỉ dùng trên web trong demo này.");
      }
    } catch (err) {
      console.error("handlePayment error:", err);
      // Lỗi "Failed to fetch" thường là do sai IP hoặc server Node.js chưa chạy
      setMessage("Lỗi kết nối server (Kiểm tra IP và đảm bảo server Node.js đang chạy)");
    }
  };

  // Component UI lựa chọn thanh toán MỚI
  const PaymentOption = ({ id, title, logo, selected, onSelect }: {
    id: string;
    title: string;
    logo?: string[];
    selected: boolean;
    onSelect: (id: string) => void;
  }) => (
    <TouchableOpacity
      style={[styles.paymentOption, selected && styles.paymentOptionSelected]}
      onPress={() => onSelect(id)}
    >
      <View style={styles.paymentLeft}>
        <View
          style={[
            styles.radioButton,
            selected && styles.radioButtonSelected,
          ]}
        >
          {selected && <View style={styles.radioButtonInner} />}
        </View>
        <Text style={styles.paymentTitle}>{title}</Text>
      </View>
      {logo && (
        <View style={styles.paymentLogos}>
          {logo.map((item, index) => (
            <View key={index} style={styles.logoBox}>
              <Text style={styles.logoText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );


  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Checkout", headerShown: false }} />

      {/* Header (Lấy từ code mới) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <TouchableOpacity>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Payment Method Section (Lấy từ code mới) */}
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <PaymentOption
            id="card"
            title="Credit Card"
            logo={["VISA", "MC"]}
            selected={selectedPayment === "card"}
            onSelect={setSelectedPayment}
          />

          <PaymentOption
            id="vnpay"
            title="VNPay"
            logo={["VNPAY"]}
            selected={selectedPayment === "vnpay"}
            onSelect={setSelectedPayment}
          />

          <PaymentOption
            id="momo"
            title="MoMo"
            logo={["MoMo"]}
            selected={selectedPayment === "momo"}
            onSelect={setSelectedPayment}
          />

          <PaymentOption
            id="cod"
            title="Thanh toán khi nhận hàng"
            selected={selectedPayment === "cod"}
            onSelect={setSelectedPayment}
          />

          {/* Card Details - Only show if Credit Card is selected */}
          {selectedPayment === "card" && (
            <View style={styles.cardDetailsSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Holder Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter name on card"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Terms Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAgreeTerms(!agreeTerms)}
          >
            <View
              style={[
                styles.checkbox,
                agreeTerms && styles.checkboxChecked,
              ]}
            >
              {agreeTerms && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxText}>
              I have read the{" "}
              <Text style={styles.linkText}>preliminary information conditions</Text> and
              the <Text style={styles.linkText}>distance sales agreement</Text>.
            </Text>
          </TouchableOpacity>

          {/* Corporate Invoice Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setCorporateInvoice(!corporateInvoice)}
          >
            <View
              style={[
                styles.checkbox,
                corporateInvoice && styles.checkboxChecked,
              ]}
            >
              {corporateInvoice && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxText}>I require a corporate invoice.</Text>
          </TouchableOpacity>

          {/* Total and Pay Button (Footer mới) */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{totalVND.toLocaleString()} VNĐ</Text>
            </View>
            <TouchableOpacity
              style={[styles.payButton, !agreeTerms && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={!agreeTerms}
            >
              <Text style={styles.payButtonText}>Pay</Text>
            </TouchableOpacity>
          </View>

          {/* Message (Lấy từ code mới) */}
          {message !== "" && (
            <View
              style={[
                styles.messageBox,
                message.includes("thành công")
                  ? styles.messageSuccess
                  : styles.messageError,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.includes("thành công")
                    ? styles.messageTextSuccess
                    : styles.messageTextError,
                ]}
              >
                {message}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// STYLES MỚI (Giữ nguyên)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  skipButton: {
    fontSize: 16,
    color: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  paymentOption: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: "#111827",
    borderWidth: 2,
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  paymentLogos: {
    flexDirection: "row",
    gap: 8,
  },
  logoBox: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#F3F4F6",
  },
  logoText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  cardDetailsSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  inputRow: {
    flexDirection: "row",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
  },
  linkText: {
    color: "#3B82F6",
    textDecorationLine: "underline",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  payButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  messageBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  messageSuccess: {
    backgroundColor: "#D1FAE5",
  },
  messageError: {
    backgroundColor: "#FEE2E2",
  },
  messageText: {
    fontSize: 14,
    fontWeight: "500",
  },
  messageTextSuccess: {
    color: "#065F46",
  },
  messageTextError: {
    color: "#991B1B",
  },
});