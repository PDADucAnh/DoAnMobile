import React, {useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

export default function CartScreen() {
  const [cart, setCart] = useState<any[]>([]);
  const router = useRouter();

useFocusEffect(
  React.useCallback(() => {
    loadCart();
  }, [])
);
  const loadCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem("cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  const saveCart = async (updatedCart: any[]) => {
    setCart(updatedCart);
    await AsyncStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const increaseQty = (id: string) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, qty: item.qty + 1 } : item
    );
    saveCart(updated);
  };

  const decreaseQty = (id: string) => {
    const updated = cart.map((item) =>
      item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item
    );
    saveCart(updated);
  };

  const removeItem = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    saveCart(updated);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const vat = 0;
  const shipping = cart.length > 0 ? 80 : 0;
  const total = subtotal + vat + shipping;

  // Khi giỏ hàng trống
  if (cart.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#b0b0b0" />
          <Text style={styles.emptyTitle}>Your Cart Is Empty!</Text>
          <Text style={styles.emptySubtitle}>
            When you add products, they’ll appear here.
          </Text>
        </View>
      </View>
    );
  }

  // Khi có sản phẩm trong giỏ
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <Ionicons name="notifications-outline" size={22} color="#000" />
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image
              source={
                item.image
                  ? { uri: item.image }
                  : require("../../../assets/images/products/Product1.png")
              }
              style={styles.image}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.size}>Size: {item.size}</Text>
              <Text style={styles.price}>${item.price}</Text>

              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => decreaseQty(item.id)}
                >
                  <Ionicons name="remove-outline" size={18} color="#000" />
                </TouchableOpacity>
                <Text style={styles.qty}>{item.qty}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => increaseQty(item.id)}
                >
                  <Ionicons name="add-outline" size={18} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={() => removeItem(item.id)}>
              <Ionicons name="trash-outline" size={22} color="red" />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 160 }}
      />

      <View style={styles.summary}>
        <View style={styles.row}>
          <Text style={styles.label}>Sub-total</Text>
          <Text style={styles.value}>${subtotal}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>VAT (%)</Text>
          <Text style={styles.value}>${vat}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Shipping fee</Text>
          <Text style={styles.value}>${shipping}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => router.push("/(pay)")}
        >
          <Text style={styles.checkoutText}>Go To Checkout →</Text>
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 16, fontWeight: "600" },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginTop: 10 },
  emptySubtitle: { fontSize: 14, color: "gray", marginTop: 4 },

  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  image: { width: 70, height: 70, borderRadius: 8, marginRight: 10 },
  name: { fontSize: 14, fontWeight: "600" },
  size: { fontSize: 12, color: "gray", marginVertical: 2 },
  price: { fontSize: 14, fontWeight: "700", marginTop: 3 },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  qty: { marginHorizontal: 8, fontSize: 14 },

  summary: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: { color: "gray", fontSize: 14 },
  value: { fontWeight: "600", fontSize: 14 },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalValue: { fontSize: 16, fontWeight: "700" },

  checkoutBtn: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
