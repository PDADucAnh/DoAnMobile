import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { GET_ALL, GET_IMG } from "../../../APIService";
// 1. Import FilterModal và các kiểu dữ liệu
import FilterModal, { FilterOptions } from "../../components/FilterModal";

interface Product {
  productId: number;
  productName?: string;
  price: number;
  specialPrice?: number;
  image: string;
  category: { categoryId: number; categoryName: string };
  description?: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(0);

  // 2. State mới cho Lọc (Filter)
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions | null>(
    null
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await GET_ALL(
          "public/categories?pageNumber=0&pageSize=10&sortBy=categoryId&sortOrder=asc"
        );
        setCategories(res.data.content || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // 3. Cập nhật useEffect để fetch theo cả Lọc (Filters)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // ===================================
        // BẮT ĐẦU SỬA LỖI
        // ===================================

        // 1. Endpoint KHÔNG chứa logic sort
        let endpoint =
          selectedCategory && selectedCategory !== 0
            ? `public/categories/${selectedCategory}/products?pageNumber=0&pageSize=50`
            : "public/products?pageNumber=0&pageSize=50";
        
        // 2. Biến sortQuery mặc định
        let sortQuery = "&sortBy=productId&sortOrder=asc"; // Mặc định (Oldest/Relevance)

        // 3. Cập nhật BIẾN 'sortQuery', KHÔNG CẬP NHẬT 'endpoint'
        if (appliedFilters) {
          if (appliedFilters.sortBy === "Price: Low - High") {
            sortQuery = "&sortBy=price&sortOrder=asc"; // Sửa ở đây
          } else if (appliedFilters.sortBy === "Price: High - Low") {
            sortQuery = "&sortBy=price&sortOrder=desc"; // Sửa ở đây
          } else if (appliedFilters.sortBy === "Newest") {
            sortQuery = "&sortBy=productId&sortOrder=desc"; // Sửa ở đây
          }
          // (Không cần 'else' vì 'sortQuery' đã có mặc định)
        }
        
        // 4. Thêm sortQuery vào endpoint MỘT LẦN DUY NHẤT
        endpoint += sortQuery;

        // ===================================
        // KẾT THÚC SỬA LỖI
        // ===================================
        
        console.log("Đang gọi API:", endpoint); // Thêm log để debug
        const res = await GET_ALL(endpoint);
        const data = res.data.content || [];
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, appliedFilters]);

  const handleApplyFilters = (filters: FilterOptions) => {
    setAppliedFilters(filters);
    console.log("Đã áp dụng Lọc:", filters);
  };

  // 5. Lọc sản phẩm (chỉ lọc theo giá ở frontend nếu backend không hỗ trợ)
  const filteredProducts = products.filter((p) => {
    // (Bỏ qua search query, vì nó đã chuyển sang trang Search)

    // Lọc theo giá (nếu backend chưa lọc)
    if (appliedFilters) {
      const price = p.specialPrice ?? p.price;
      return (
        price >= appliedFilters.priceRange[0] &&
        price <= appliedFilters.priceRange[1]
      );
    }
    return true; // Nếu không có filter, trả về true
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        products={products} // 1. Truyền 'products' (chưa lọc) vào modal
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Ionicons name="notifications-outline" size={24} color="#000" />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.8}
          onPress={() => router.push("/(tabs)/(search)")}
        >
          <Ionicons name="search-outline" size={20} color="#888" />
          <Text style={styles.searchInputPlaceholder}>
            Search for clothes...
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Categories (Giữ nguyên) */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={[{ categoryId: 0, categoryName: "All" }, ...categories]}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item.categoryId;
            return (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  isActive ? styles.categoryButtonActive : null,
                ]}
                onPress={() => setSelectedCategory(item.categoryId)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive ? styles.categoryTextActive : null,
                  ]}
                >
                  {item.categoryName}
                </Text>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item.categoryId.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Product list */}
      <FlatList
        data={filteredProducts} // 2. Hiển thị 'filteredProducts' (đã lọc)
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(product)/${item.productId}`)}
          >
            <Image
              source={{ uri: GET_IMG("products", item.image) }}
              style={styles.image}
              resizeMode="cover"
            />
            <Text style={styles.title}>{item.productName || "No Name"}</Text>
            <Text style={styles.categoryName}>
              {item.category?.categoryName || "Uncategorized"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {item.specialPrice != null &&
                item.specialPrice !== item.price && (
                  <Text style={styles.oldPrice}>{item.price} VND</Text>
                )}
              <Text style={styles.price}>
                {item.specialPrice != null ? item.specialPrice : item.price} VND
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.productId.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// 8. Cập nhật Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold" },

  // Sửa lại search bar
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    marginBottom: 10,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 48, // Chiều cao cố định
  },
  searchInputPlaceholder: {
    flex: 1,
    padding: 8,
    color: "#888",
  },
  // Nút Lọc (Filter) mới
  filterButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  // (Phần styles còn lại giữ nguyên)
  categoryContainer: {
    marginBottom: 10,
  },
  categoryList: {
    paddingHorizontal: 10,
    alignItems: "center",
  },
  categoryButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    minWidth: 80,
    alignItems: "center",
  },
  categoryButtonActive: {
    backgroundColor: "#000",
  },
  categoryText: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  list: { paddingHorizontal: 10, paddingBottom: 70 },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 8,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  image: { width: "100%", height: 150, borderRadius: 10, marginBottom: 8 },
  title: { fontSize: 14, fontWeight: "600", marginBottom: 5 },
  categoryName: { fontSize: 12, color: "#666", marginBottom: 5 },
  price: { fontSize: 14, fontWeight: "bold", color: "#000" },
  oldPrice: {
    fontSize: 12,
    color: "gray",
    textDecorationLine: "line-through",
    marginRight: 5,
  },
});