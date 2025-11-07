import React, { useState, useCallback, useMemo } from "react";
// ... (các import khác giữ nguyên)
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GET_USER_ORDERS, GET_IMG } from "../../APIService";

// ===================================
// BẮT ĐẦU SỬA LỖI
// ===================================

// Đây là kiểu dữ liệu MÀ CHÚNG TA MUỐN (dùng snake_case cho component)
interface OrderItem {
  order_item_id: number;
  quantity: number;
  ordered_product_price: number;
  order_status: string; 
  product_name: string;
  image: string; 
  size: string; 
}

// Đây là kiểu dữ liệu MÀ API GỬI VỀ (dùng camelCase)
interface ApiProduct {
  productId: number;
  productName: string;
  image: string;
  // ... (các trường khác của product)
}
interface ApiOrderItem {
  orderItemId: number;
  product: ApiProduct;
  quantity: number;
  orderedProductPrice: number;
}
interface ApiOrderDTO {
  orderId: number;
  orderStatus: string;
  totalAmount: number;
  orderDate: string;
  orderItems: ApiOrderItem[]; 
}


export default function OrderScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Ongoing" | "Completed">(
    "Ongoing"
  );
  const [allOrderItems, setAllOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load đơn hàng khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    setLoading(true);
    try {
      const email = await AsyncStorage.getItem("user-email");
      if (!email) {
        console.error("Không tìm thấy email người dùng");
        setLoading(false);
        return;
      }
      
      const response = await GET_USER_ORDERS(email); 
      // 1. Nhận dữ liệu camelCase từ API
      const orders: ApiOrderDTO[] = response.data || [];

      console.log("--- DỮ LIỆU GỐC TỪ API (TRƯỚC KHI LỌC) ---");
      console.log(JSON.stringify(orders, null, 2)); 
      console.log("-----------------------------------------");

      // 2. "Làm phẳng" (Flatten) VÀ "Chuyển đổi" (Transform)
      const flattenedItems: OrderItem[] = orders
        // Lọc các đơn hàng hợp lệ
        .filter(order => order && order.orderItems && order.orderItems.length > 0) 
        .flatMap(order => 
          // Lặp qua các sản phẩm (camelCase)
          (order.orderItems || [])
            // Lọc các sản phẩm hợp lệ
            .filter(item => item && item.orderItemId && item.product) 
            .map(item => ({
              // Chuyển đổi từ camelCase (API) sang snake_case (App)
              order_item_id: item.orderItemId,
              quantity: item.quantity,
              ordered_product_price: item.orderedProductPrice,
              
              // Lấy từ đối tượng 'product' lồng nhau
              product_name: item.product.productName,
              image: item.product.image,
              size: "M", // 'size' không có trong API, dùng tạm
              
              // Sao chép 'orderStatus' (camelCase) từ cha
              order_status: order.orderStatus, 
            }))
        );
      
      console.log("Đã tải và làm phẳng các sản phẩm:", flattenedItems);
      setAllOrderItems(flattenedItems); // Lưu danh sách sản phẩm (snake_case)

    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
      setAllOrderItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Lọc danh sách đơn hàng dựa trên tab
  const filteredOrders = useMemo(() => {
    const ongoingStatus = ["in transit", "packing", "picked", "order accepted !"];
    
    // Code này giờ đã đúng vì allOrderItems là snake_case
    if (activeTab === "Ongoing") {
      return allOrderItems.filter((item) =>
        ongoingStatus.includes((item.order_status || "").toLowerCase())
      );
    } else {
      return allOrderItems.filter((item) =>
        !ongoingStatus.includes((item.order_status || "").toLowerCase())
      );
    }
  }, [allOrderItems, activeTab]);

  // ===================================
  // KẾT THÚC SỬA LỖI
  // ===================================

  // Component render từng thẻ đơn hàng (Theo Ảnh 1)
  // Code này giờ đã đúng vì item là snake_case
  const OrderCard = ({ item }: { item: OrderItem }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: GET_IMG("products", item.image) }}
        style={styles.cardImage}
      />
      <View style={styles.cardDetails}>
        <Text style={styles.cardTitle}>{item.product_name}</Text>
        <Text style={styles.cardSize}>Size: {item.size || "M"}</Text> 
        <Text style={styles.cardPrice}>
          $ {item.ordered_product_price.toLocaleString()}
        </Text>
      </View>
      <View style={styles.cardRight}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.order_status || "Pending"}</Text>
        </View>
        <TouchableOpacity style={styles.trackButton}>
          <Text style={styles.trackButtonText}>Track Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Component render khi không có đơn hàng (Theo Ảnh 2)
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={80} color="#b0b0b0" />
      <Text style={styles.emptyTitle}>No {activeTab} Orders!</Text>
      <Text style={styles.emptySubtitle}>
        You don&apos;t have any {activeTab.toLowerCase()} orders at this time.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Tabs Ongoing/Completed */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "Ongoing" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("Ongoing")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Ongoing" && styles.tabTextActive,
            ]}
          >
            Ongoing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "Completed" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("Completed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Completed" && styles.tabTextActive,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Nội dung */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#000" />
      ) : filteredOrders.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredOrders} 
          renderItem={({ item }) => <OrderCard item={item} />}
          // Code này giờ đã đúng vì item là snake_case
          keyExtractor={(item) => item.order_item_id.toString()}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

// Styles (Giữ nguyên)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    paddingTop: 50, // An toàn cho tai thỏ
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 30,
    margin: 15,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 30,
  },
  tabButtonActive: {
    backgroundColor: "#fff",
  },
  tabText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
  },
  tabTextActive: {
    color: "#000",
    fontWeight: "600",
  },
  
  // Trạng thái trống
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: -50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 15,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
  },

  // Thẻ đơn hàng
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardSize: {
    fontSize: 14,
    color: "#777",
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  cardRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  statusBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#555",
  },
  trackButton: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  trackButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});