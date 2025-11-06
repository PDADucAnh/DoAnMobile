import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal, // 1. Thêm Modal
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons"; // 2. Thêm Ionicons
import { Alert } from "react-native/Libraries/Alert/Alert";

type CartItem = {
  // Giữ nguyên type của bạn
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  size?: string;
  // Đảm bảo các thuộc tính này có trong giỏ hàng của bạn
  productId?: number;
  quantity?: number;
};

// 3. Component Modal (Theo Ảnh 1)
const PaymentStatusModal = ({
  visible,
  status,
  onClose,
}: {
  visible: boolean;
  status: "success" | "failed";
  onClose: () => void;
}) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          {status === "success" ? (
            <>
              <Ionicons
                name="checkmark-circle"
                size={80}
                color="#28a745" // Màu xanh lá
              />
              <Text style={styles.modalTitle}>Congratulations!</Text>
              <Text style={styles.modalSubtitle}>
                Your order has been placed.
              </Text>
              <TouchableOpacity style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Track Your Order</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Ionicons
                name="close-circle"
                size={80}
                color="#dc3545" // Màu đỏ
              />
              <Text style={styles.modalTitle}>Payment failed!</Text>
              <Text style={styles.modalSubtitle}>Please pay again!</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={onClose} // Nút này chỉ đóng modal
              >
                <Text style={styles.modalButtonText}>Try Again</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default function CheckoutScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  
  // State cho UI mới
  const [selectedMethodType, setSelectedMethodType] = useState<"Card" | "Cash" | "Pay">("Card");
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | null>(null);

  // Giữ nguyên logic load data của bạn
  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      const s = await AsyncStorage.getItem("checkoutData");
      if (s) {
        const parsed = JSON.parse(s);
        setCart(parsed.cart || []);
        // Tính toán lại tổng phụ, phí ship...
        const subtotal = (parsed.cart || []).reduce(
          (sum: number, it: any) => sum + (it.price ?? 0) * (it.quantity ?? it.qty ?? 1), 0
        );
        const shipping = subtotal > 0 ? 0 : 0; // Giả sử phí ship
        setTotal(subtotal + shipping);
      }
    } catch (err) {
      console.error("Error loading checkoutData:", err);
    }
  };

  // Hàm này sẽ xử lý việc đặt hàng
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("Giỏ hàng trống", "Bạn chưa có sản phẩm để thanh toán.");
      return;
    }

    // Nếu chọn VNPay
    if (selectedMethodType === "Cash") { // Giả sử "Cash" là VNPay
       // Chuyển hướng đến màn hình VNPay
       router.push("/vnpay-demo"); // Hoặc screen VNPay của bạn
       return;
    }

    // Nếu chọn Card hoặc Pay (Giả lập)
    // TODO: Gọi API đặt hàng thật ở đây

    // Giả lập thành công
    setPaymentStatus("success");
    // Hiển thị modal trong 2 giây rồi tự động tắt
    setTimeout(() => {
      setPaymentStatus(null);
      // TODO: Điều hướng về trang chủ hoặc trang đơn hàng
      // router.replace("/(tabs)/(home)");
    }, 2000); // 2 giây

    // // Giả lập thất bại (bạn có thể test bằng cách uncomment dòng này)
    // setPaymentStatus("failed");
  };

  // Hàm này điều hướng đến trang chọn thẻ
  const handleNavigateToPaymentMethod = () => {
    // Điều hướng đến trang chọn thẻ (Ảnh 3)
    router.push("/(pay)/PaymentScreen");
  };

  // Tính toán lại các giá trị cho Order Summary
  const subtotal = cart.reduce(
    (sum: number, it: any) => sum + (it.price ?? 0) * (it.quantity ?? it.qty ?? 1), 0
  );
  const shippingFee = subtotal > 0 ? 0 : 0;
  const vat = 0; // Giả sử VAT 0
  const finalTotal = subtotal + shippingFee + vat;


  return (
    <View style={styles.container}>
      {/* 1. Modal Thành công/Thất bại */}
      <PaymentStatusModal
        visible={!!paymentStatus}
        status={paymentStatus || "success"}
        onClose={() => setPaymentStatus(null)}
      />

      {/* 2. Header (Giống Ảnh 2) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 3. Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressBox}>
            <Ionicons name="location-sharp" size={20} color="#000" />
            <View style={styles.addressDetails}>
              <Text style={styles.addressTitle}>Home</Text>
              <Text style={styles.addressText}>
                925 S Chugach St #APT 10, Alaska 99645
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.methodToggle}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                selectedMethodType === "Card" && styles.methodButtonActive,
              ]}
              onPress={() => setSelectedMethodType("Card")}
            >
              <Ionicons name="card" size={20} color={selectedMethodType === "Card" ? "#fff" : "#000"}/>
              <Text style={[styles.methodButtonText, selectedMethodType === "Card" && styles.methodButtonTextActive]}>Card</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.methodButton,
                selectedMethodType === "Cash" && styles.methodButtonActive,
              ]}
              onPress={() => setSelectedMethodType("Cash")}
            >
              <Ionicons name="cash-outline" size={20} color={selectedMethodType === "Cash" ? "#fff" : "#000"}/>
              <Text style={[styles.methodButtonText, selectedMethodType === "Cash" && styles.methodButtonTextActive]}>Cash</Text>
            </TouchableOpacity>
             <TouchableOpacity
              style={[
                styles.methodButton,
                selectedMethodType === "Pay" && styles.methodButtonActive,
              ]}
              onPress={() => setSelectedMethodType("Pay")}
            >
              <Ionicons name="logo-apple" size={20} color={selectedMethodType === "Pay" ? "#fff" : "#000"}/>
              <Text style={[styles.methodButtonText, selectedMethodType === "Pay" && styles.methodButtonTextActive]}>Pay</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.selectedCardBox}
            onPress={handleNavigateToPaymentMethod} // Bấm vào đây để sang trang chọn thẻ (Ảnh 3)
          >
            <Ionicons name="cart" size={30} color="#1a1f71" />
            <Text style={styles.selectedCardText}>**** **** **** 2512</Text>
            <Ionicons name="pencil" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* 5. Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sub-total</Text>
            <Text style={styles.summaryValue}>$ {subtotal.toFixed(2)}</Text>
          </View>
           <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>VAT (%)</Text>
            <Text style={styles.summaryValue}>$ {vat.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping fee</Text>
            <Text style={styles.summaryValue}>$ {shippingFee.toFixed(2)}</Text>
          </View>
        </View>
        
        {/* 6. Promo Code */}
         <View style={styles.promoContainer}>
            <Ionicons name="ticket-outline" size={20} color="#888" style={styles.promoIcon}/>
            <TextInput placeholder="Enter promo code" style={styles.promoInput}/>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Add</Text>
            </TouchableOpacity>
         </View>

      </ScrollView>

      {/* 7. Footer */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>$ {finalTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.applyBtn} onPress={handlePlaceOrder}>
          <Text style={styles.applyBtnText}>Place Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 8. Styles (Đã viết lại toàn bộ)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50 },
  scrollView: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: { fontSize: 20, fontWeight: "700" },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 15 },
  changeText: { fontSize: 14, color: "#555" },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
  },
  addressDetails: { marginLeft: 10 },
  addressTitle: { fontSize: 16, fontWeight: "500" },
  addressText: { fontSize: 14, color: "#666", marginTop: 2 },
  
  methodToggle: { flexDirection: "row", justifyContent: "space-around", marginBottom: 15 },
  methodButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    marginHorizontal: 5,
  },
  methodButtonActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  methodButtonText: { fontSize: 14, fontWeight: "500", marginLeft: 5, color: "#000" },
  methodButtonTextActive: { color: "#fff" },

  selectedCardBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    justifyContent: "space-between",
  },
  selectedCardText: { flex: 1, fontSize: 16, fontWeight: "500", marginLeft: 15 },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 16, color: "#666" },
  summaryValue: { fontSize: 16, fontWeight: "500" },

  promoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  promoIcon: { marginRight: 10 },
  promoInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  promoButton: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  promoButtonText: { color: "#fff", fontWeight: "600" },

  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#f0f0f0",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  totalLabel: { fontSize: 18, color: "#666" },
  totalValue: { fontSize: 22, fontWeight: "700" },
  applyBtn: {
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  applyBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  // Styles cho Modal
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  modalButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});