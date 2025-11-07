import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GET_ID, GET_IMG, POST_ADD, PUT_EDIT } from "../../APIService";

interface Product {
  productId: number;
  productName: string;
  price: number;
  specialPrice?: number;
  image: string;
  description?: string;
  categoryId: number;
}

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity] = useState(1);
  const [cartId, setCartId] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const productRes = await GET_ID("public/products", id);
          setProduct(productRes.data);
        }
        const email = await AsyncStorage.getItem("user-email");
        if (email) {
          const userRes = await GET_ID(
            "public/users/email",
            encodeURIComponent(email)
          );
          setCartId(userRes.data.cart.cartId);
        }
      } catch (error) {
        console.error("Error loading product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // --- Thêm mới: Đồng bộ AsyncStorage sau khi thêm sản phẩm ---
  const handleAddToCart = async () => {
    if (!cartId || !id || !product) {
      Alert.alert("Error", "Unable to find your cart or product data.");
      return;
    }

    try {
      const endpoint = `public/carts/${cartId}/products/${id}/quantity/${quantity}`;
      await POST_ADD(endpoint, null);

      // Cập nhật local AsyncStorage
      const storedCart = await AsyncStorage.getItem("cart");
      const localCart = storedCart ? JSON.parse(storedCart) : [];

      const existingIndex = localCart.findIndex((item: any) => item.id === id);
      if (existingIndex !== -1) {
        localCart[existingIndex].qty += quantity;
      } else {
        localCart.push({
          id: id,
          name: product.productName,
          price: product.specialPrice || product.price,
          image: GET_IMG("products", product.image),
          qty: quantity,
          size: selectedSize || "M",
        });
      }

      await AsyncStorage.setItem("cart", JSON.stringify(localCart));
      Alert.alert("Success", "Product added to cart!");
      router.replace("/(tabs)/(cart)");
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        try {
          const updateEndpoint = `public/carts/${cartId}/products/${id}/quantity/${quantity}`;
          await PUT_EDIT(updateEndpoint, null);

          // Đồng bộ AsyncStorage
          const storedCart = await AsyncStorage.getItem("cart");
          const localCart = storedCart ? JSON.parse(storedCart) : [];
          const existingIndex = localCart.findIndex((item: any) => item.id === id);

          if (existingIndex !== -1) {
            localCart[existingIndex].qty += quantity;
            await AsyncStorage.setItem("cart", JSON.stringify(localCart));
          }

          Alert.alert("Updated", "Product quantity updated in cart.");
          router.replace("/(tabs)/(cart)");
        } catch (updateError) {
          console.error("Error updating product:", updateError);
          Alert.alert("Error", "Unable to update product.");
        }
      } else {
        console.error("Error adding product:", error);
        Alert.alert("Error", "Unable to add product to cart.");
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: GET_IMG("products", product.image) }}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.productName}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#f5a623" />
            <Text style={styles.ratingText}>4.0/5</Text>
            <Text style={styles.reviewCount}>(45 reviews)</Text>
          </View>

          <Text style={styles.description}>
            {product.description ||
              "The name says it all, the right size slightly snugs the body leaving enough room for comfort in the sleeves and waist."}
          </Text>

          <Text style={styles.sizeLabel}>Choose size</Text>
          <View style={styles.sizeOptions}>
            {["S", "M", "L"].map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeButton,
                  selectedSize === size && styles.sizeButtonActive,
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text
                  style={[
                    styles.sizeText,
                    selectedSize === size && styles.sizeTextActive,
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>
            {product.specialPrice || product.price} VND
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#000" },
  image: { width: "100%", height: 300, backgroundColor: "#fff" },
  infoContainer: { padding: 16 },
  productName: { fontSize: 18, fontWeight: "bold", color: "#000" },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  ratingText: { fontSize: 14, fontWeight: "500", marginLeft: 4 },
  reviewCount: { fontSize: 14, color: "#666", marginLeft: 4 },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  sizeLabel: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  sizeOptions: { flexDirection: "row", gap: 10 },
  sizeButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sizeButtonActive: {
    borderColor: "#000",
    backgroundColor: "#000",
  },
  sizeText: { fontSize: 14, color: "#000" },
  sizeTextActive: { color: "#fff" },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    padding: 16,
    backgroundColor: "#fff",
  },
  priceLabel: { fontSize: 14, color: "#666" },
  priceValue: { fontSize: 20, fontWeight: "bold", color: "#000" },
  addButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
