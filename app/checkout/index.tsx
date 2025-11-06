// app/checkout/index.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  size?: string;
};

export default function CheckoutScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState<
    "card" | "vnpay" | "cod"
  >("card");

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      const s = await AsyncStorage.getItem("checkoutData");
      if (s) {
        const parsed = JSON.parse(s);
        setCart(parsed.cart || []);
        setTotal(parsed.total || 0);
      } else {
        // fallback: try load cart and compute total
        const storedCart = await AsyncStorage.getItem("cart");
        const c = storedCart ? JSON.parse(storedCart) : [];
        setCart(c);
        const subtotal = c.reduce(
          (sum: number, it: any) => sum + it.price * it.qty,
          0
        );
        setTotal(subtotal);
      }
    } catch (err) {
      console.error("Error loading checkoutData:", err);
    }
  };

  const handleApplyPayment = async () => {
    if (cart.length === 0) {
      Alert.alert("Giỏ hàng trống", "Bạn chưa có sản phẩm để thanh toán.");
      return;
    }

    // Nếu chọn VNPay -> mở màn hình PaymentScreen để gọi server vnpay và redirect
    if (selectedMethod === "vnpay") {
      // ensure checkoutData saved
      try {
        await AsyncStorage.setItem("checkoutData", JSON.stringify({ cart, total }));
        // navigate to PaymentScreen that will call vnpay-server
        router.push("/(pay)/PaymentScreen");
        return;
      } catch (err) {
        console.error("Error saving checkoutData:", err);
      }
    }

    // Nếu chọn thẻ (card) hoặc COD: xử lý tạm — giả lập đặt hàng qua API
    // Ở đây ta điều hướng tới payment-result và giả lập response success (thực tế bạn sẽ gọi API xử lý payment)
    router.push({
      pathname: "/payment-result",
      params: { method: selectedMethod },
    } as any);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Checkout</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tổng đơn hàng</Text>
        <Text style={styles.amount}>{total?.toLocaleString()} VND</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>

        <TouchableOpacity
          style={[
            styles.methodRow,
            selectedMethod === "card" && styles.methodRowActive,
          ]}
          onPress={() => setSelectedMethod("card")}
        >
          <Text style={styles.methodText}>Thanh toán bằng thẻ (Visa/Master)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodRow,
            selectedMethod === "vnpay" && styles.methodRowActive,
          ]}
          onPress={() => setSelectedMethod("vnpay")}
        >
          <Text style={styles.methodText}>Thanh toán bằng VNPay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodRow,
            selectedMethod === "cod" && styles.methodRowActive,
          ]}
          onPress={() => setSelectedMethod("cod")}
        >
          <Text style={styles.methodText}>Thanh toán khi nhận hàng (COD)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApplyPayment}>
          <Text style={styles.applyBtnText}>Apply & Proceed</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50 },
  header: { paddingHorizontal: 20, marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "700" },
  section: { paddingHorizontal: 20, marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  amount: { fontSize: 20, fontWeight: "700", color: "#000" },
  methodRow: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  methodRowActive: { borderColor: "#000", backgroundColor: "#00000008" },
  methodText: { fontSize: 15 },
  footer: { padding: 20 },
  applyBtn: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  applyBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
