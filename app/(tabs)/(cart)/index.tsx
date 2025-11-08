import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  // Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GET_CART,
  UPDATE_CART_QUANTITY,
  DELETE_CART_PRODUCT,
  GET_IMG,
} from "../../../APIService";

export default function CartScreen() {
  const [cart, setCart] = useState<any[]>([]);
  const router = useRouter();
  const [cartId, setCartId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  //=========================fix load cart=============================

// Hàm trợ giúp để tìm số lượng đúng
function getCorrectQuantity(item: any): number {
  // 1. Ưu tiên "cartQuantity" (nếu backend có trả)
  if (typeof item.cartQuantity === "number" && item.cartQuantity > 0) {
    return Number(item.cartQuantity);
  }
  // 2. Ưu tiên "quantityInCart" (nếu backend có trả)
  if (typeof item.quantityInCart === "number" && item.quantityInCart > 0) {
    return Number(item.quantityInCart);
  }
  // 3. Cuối cùng mới lấy "quantity"
  if (typeof item.quantity === "number" && item.quantity > 0) {
    const qty = Number(item.quantity);
    // Giả sử nếu backend trả về số lượng > 20, đó là hàng tồn kho
    if (qty > 20) {
      return 1; // Mặc định là 1 nếu số lượng quá lớn (vd: 98, 11)
    }
    return qty; // Trả về số lượng (vd: 10)
  }
  // 4. Nếu không tìm thấy gì, mặc định là 1
  return 1;
}

// BƯỚC 1: ĐỊNH NGHĨA loadCartFromApi
const loadCartFromApi = useCallback(async () => {
  try {
    const storedCartId = await AsyncStorage.getItem("cart-id");
    const storedEmail = await AsyncStorage.getItem("user-email");

    if (storedCartId && storedEmail) {
      setCartId(storedCartId);
      setUserEmail(storedEmail); 

      const response = await GET_CART(storedEmail, storedCartId);

      const products = (response.data.products || []).map((p: any) => ({
        ...p,
        price: p.specialPrice ?? p.price,
        quantity: getCorrectQuantity(p),
      }));

      setCart(products);
    } else {
      setCart([]);
    }
  } catch (error) {
    console.error("Error loading cart from API:", error);
  }
}, [setCartId, setCart]); // Thêm dependencies

// BƯỚC 2: SỬ DỤNG useFocusEffect (SAU KHI ĐÃ ĐỊNH NGHĨA HÀM)
useFocusEffect(
  useCallback(() => {
    loadCartFromApi();
  }, [loadCartFromApi]) // Thêm dependency
);

  //======================================fix increase, decrease, remove item=========================
  //  Tăng số lượng
  const increaseQty = async (productId: number) => {
    if (!cartId) return;

    // 1. Lưu lại giỏ hàng cũ (để rollback nếu API lỗi)
    const oldCart = [...cart];

    // 2. Cập nhật UI ngay lập tức (Optimistic Update)
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Number(item.quantity) + 1 } // Tăng 1
          : item
      )
    );

    // 3. Tìm sản phẩm và gọi API trong nền
    const itemToUpdate = cart.find((item) => item.productId === productId);
    if (!itemToUpdate) return;

    const newQty = Number(itemToUpdate.quantity) + 1;

    try {
      await UPDATE_CART_QUANTITY(cartId, productId, newQty);
      // Gọi API thành công: Không cần làm gì, UI đã đúng.
    } catch (error) {
      console.error("Error increasing quantity:", error);
      // 4. Lỗi: Hoàn tác lại UI về trạng thái cũ
      setCart(oldCart);
      // (Nên thêm Alert báo lỗi cho người dùng ở đây)
    }
  };

  // Giảm số lượng
  const decreaseQty = async (productId: number) => {
    if (!cartId) return;

    const itemToUpdate = cart.find((item) => item.productId === productId);
    if (!itemToUpdate) return;

    const newQty = Number(itemToUpdate.quantity) - 1;

    // Nếu giảm xuống 0, thì chuyển sang XÓA
    if (newQty <= 0) {
      removeItem(productId); // Tái sử dụng hàm xóa
      return;
    }

    // 1. Lưu giỏ hàng cũ
    const oldCart = [...cart];

    // 2. Cập nhật UI ngay lập tức
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQty } // Gán số lượng mới
          : item
      )
    );

    // 3. Gọi API trong nền
    try {
      await UPDATE_CART_QUANTITY(cartId, productId, newQty);
    } catch (error) {
      console.error("Error decreasing quantity:", error);
      // 4. Lỗi: Hoàn tác
      setCart(oldCart);
    }
  };

  // [SỬA] Xóa sản phẩm
  const removeItem = async (productId: number) => {
    if (!cartId) return;

    // 1. Lưu giỏ hàng cũ
    const oldCart = [...cart];

    // 2. Cập nhật UI ngay lập tức
    setCart((prevCart) =>
      prevCart.filter((item) => item.productId !== productId)
    );

    // 3. Gọi API trong nền
    try {
      await DELETE_CART_PRODUCT(cartId, productId);
    } catch (error) {
      console.error("Error removing item:", error);
      // 4. Lỗi: Hoàn tác
      setCart(oldCart);
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const vat = 0;
  const shipping = cart.length > 0 ? 0 : 0;
  const total = subtotal + vat + shipping;

  const handleCheckout = async () => {
    try {
      await AsyncStorage.setItem(
        "checkoutData",
        JSON.stringify({ cart, total })
      );
      router.push("/checkout");
    } catch (error) {
      console.error("Error navigating to checkout:", error);
    }
  };

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
        keyExtractor={(item) => item.productId.toString()}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image
              source={
                item.image
                  ? { uri: GET_IMG("products", item.image) }
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
                  onPress={() => decreaseQty(item.productId)}
                >
                  <Ionicons name="remove-outline" size={18} color="#000" />
                </TouchableOpacity>
                <Text style={styles.qty}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => increaseQty(item.productId)}
                >
                  <Ionicons name="add-outline" size={18} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={() => removeItem(item.productId)}>
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

        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
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