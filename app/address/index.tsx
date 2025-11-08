import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GET_ID } from "../../APIService"; // Dùng hàm GET_ID (get user by email)

// Kiểu dữ liệu từ AddressDTO.java
interface Address {
  addressId: number;
  street: string;
  buildingName: string; // Sẽ dùng làm "Nickname" (Home, Office)
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export default function AddressScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [])
  );

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const email = await AsyncStorage.getItem("user-email");
      if (!email) {
        throw new Error("Không tìm thấy email");
      }
      // 1. Lấy thông tin user (đã bao gồm danh sách địa chỉ)
      const response = await GET_ID("public/users/email", email);
      const userAddresses = response.data.addresses || [];
      setAddresses(userAddresses);

      // 2. Tạm thời chọn địa chỉ đầu tiên làm mặc định
      if (userAddresses.length > 0) {
        setSelectedAddressId(userAddresses[0].addressId);
      }
    } catch (err) {
      console.error("Lỗi tải địa chỉ:", err);
    } finally {
      setLoading(false);
    }
  };

  // Component render từng thẻ địa chỉ
  const AddressCard = ({ item }: { item: Address }) => {
    const isSelected = selectedAddressId === item.addressId;
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardActive]}
        onPress={() => setSelectedAddressId(item.addressId)}
      >
        <Ionicons name="location-sharp" size={24} color="#555" />
        <View style={styles.cardDetails}>
          <Text style={styles.cardTitle}>{item.buildingName}</Text>
          <Text style={styles.cardText}>
            {/* Hiển thị tóm tắt địa chỉ */}
            {item.street}, {item.city}, {item.state}
          </Text>
        </View>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Address</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Nội dung */}
      <ScrollView>
        <Text style={styles.sectionTitle}>Saved Address</Text>

        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={addresses}
            renderItem={({ item }) => <AddressCard item={item} />}
            keyExtractor={(item) => item.addressId.toString()}
            scrollEnabled={false} // Tắt cuộn của FlatList (vì đã có ScrollView)
          />
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/address/add")}
        >
          <Ionicons name="add" size={24} color="#000" />
          {/* ===================================
          BẮT ĐẦU SỬA LỖI
          =================================== */}
          <Text style={styles.addButtonText}>New Address</Text>
          {/* ===================================
          KẾT THÚC SỬA LỖI
          =================================== */}
        </TouchableOpacity>
      </ScrollView>

      {/* Nút Apply */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => router.back()} // Chỉ quay lại
        >
          <Text style={styles.applyButtonText}>Apply</Text>
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
    paddingTop: 50,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    margin: 15,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 10,
  },
  cardActive: {
    borderColor: "#000",
    backgroundColor: "#f9f9f9",
  },
  cardDetails: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 3,
  },
  cardText: {
    fontSize: 14,
    color: "#666",
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
    margin: 15,
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
  applyButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});