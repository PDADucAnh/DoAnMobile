import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OrderScreen() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const stored = await AsyncStorage.getItem("orders");
        if (stored) setOrders(JSON.parse(stored));
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      }
    };

    loadOrders();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch sử đơn hàng</Text>

      {orders.length === 0 ? (
        <Text>Chưa có đơn hàng nào.</Text>
      ) : (
        <FlatList
          data={orders.reverse()} // mới nhất lên đầu
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.order}>
              <Text style={styles.name}>Mã đơn: {item.id}</Text>
              <Text>Tổng tiền: {item.total.toLocaleString()} đ</Text>
              <Text>Trạng thái: {item.status}</Text>
              <Text>Ngày đặt: {item.createdAt}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  order: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  name: { fontSize: 16, fontWeight: "500" },
});
