import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { GET_ALL, GET_IMG } from "../../../APIService"; // Import API
import FilterModal, {
  FilterOptions,
} from "../../components/FilterModal"; // Import Modal

// (Interface Product và Category giống như trang Home)
interface Product {
  productId: number;
  productName?: string;
  price: number;
  specialPrice?: number;
  image: string;
  category: { categoryId: number; categoryName: string };
}

// Dữ liệu giả cho Recent Searches
const RECENT_SEARCHES = [
  "Jeans",
  "Casual clothes",
  "Hoodie",
  "Nike shoes black",
  "V-neck tshirt",
];

// ===================================
// BẮT ĐẦU SỬA LỖI TÌM KIẾM
// ===================================

/**
 * Hàm xóa dấu (diacritics) khỏi chuỗi tiếng Việt.
 * Ví dụ: "Quần Jeans" -> "Quan Jeans"
 */
function removeAccents(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase() // 1. Chuyển về chữ thường
    .normalize("NFD") // 2. Tách dấu ra
    .replace(/[\u0300-\u036f]/g, "") // 3. Xóa các ký tự dấu
    .replace(/đ/g, "d"); // 4. Chuyển đổi 'đ' thành 'd'
}

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions | null>(null);

  // Logic gọi API tìm kiếm
  useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([]); 
      return; 
    }

    const fetchSearch = async () => {
      setLoading(true);
      try {

            // 1. Xây dựng query sắp xếp
        let sortQuery = "&sortBy=productId&sortOrder=asc"; // Mặc định (Oldest/Relevance)
        if (appliedFilters) {
          if (appliedFilters.sortBy === "Price: Low - High") {
            sortQuery = "&sortBy=price&sortOrder=asc";
          } else if (appliedFilters.sortBy === "Price: High - Low") {
            sortQuery = "&sortBy=price&sortOrder=desc";
          } else if (appliedFilters.sortBy === "Newest") {
            sortQuery = "&sortBy=productId&sortOrder=desc"; // Mới nhất
          }
        }

        // 2. Gọi API (vẫn là API /products vì bạn không có API /search)
        const res = await GET_ALL(`public/products?pageNumber=0&pageSize=50${sortQuery}`);
        const allProducts = res.data.content || [];

        
        // 3. Chuẩn hóa chuỗi tìm kiếm (bỏ dấu 1 lần)
        const normalizedQuery = removeAccents(searchQuery);

        let filtered = allProducts.filter((p: Product) => {
          // 4. Chuẩn hóa tên sản phẩm (bỏ dấu)
          const normalizedProductName = removeAccents(p.productName || "");
          
          // 5. So sánh 2 chuỗi đã bỏ dấu
          return normalizedProductName.includes(normalizedQuery);
        });
        
        // Lọc theo giá (nếu có)
        if (appliedFilters) {
          filtered = filtered.filter((p: Product) => { 
            const price = p.specialPrice ?? p.price;
            return price >= appliedFilters.priceRange[0] && price <= appliedFilters.priceRange[1];
          });
          // (Bạn có thể thêm lọc theo sortBy ở đây nếu muốn)
        }
        
        setResults(filtered);

      } catch (err) {
        console.error("Lỗi khi tìm kiếm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();
  }, [searchQuery, appliedFilters]); 


  const handleApplyFilters = (filters: FilterOptions) => {
    setAppliedFilters(filters);
  };

  // Render các mục tìm kiếm gần đây (Ảnh 3)
  const renderRecentSearch = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Recent Searches</Text>
      {RECENT_SEARCHES.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.recentRow}
          onPress={() => setSearchQuery(item)} // Bấm để tìm
        >
          <Text style={styles.recentText}>{item}</Text>
          <Ionicons name="close-outline" size={20} color="#888" />
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render khi không có kết quả (Ảnh 5)
  const renderNoResults = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-circle-outline" size={100} color="#ccc" />
      <Text style={styles.emptyTitle}>No Results Found!</Text>
      <Text style={styles.emptySubtitle}>
        Try a similar word or something more general.
      </Text>
    </View>
  );

  // Render danh sách kết quả (Ảnh 4)
  const renderResults = () => (
    <FlatList
      data={results}
      keyExtractor={(item) => item.productId.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.resultRow}
          onPress={() => router.push(`/(product)/${item.productId}`)}
        >
          <Image
            source={{ uri: GET_IMG("products", item.image) }}
            style={styles.resultImage}
          />
          <View style={styles.resultDetails}>
            <Text style={styles.resultName}>{item.productName}</Text>
            <Text style={styles.resultPrice}>
              ${item.specialPrice ?? item.price}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#000" />
        </TouchableOpacity>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        products={results} // Truyền 'results' vào
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Search Bar (Giống Ảnh 1) */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            placeholder="Search for clothes..."
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true} // Tự động mở bàn phím
          />
          {/* (Icon micro) */}
        </View>
        
        {/* Nút Lọc (Filter) MỚI */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Nội dung (Conditional rendering) */}
      {loading ? (
        <ActivityIndicator style={{marginTop: 30}} size="large" />
      ) : searchQuery.length === 0 ? (
        renderRecentSearch()
      ) : results.length === 0 ? (
        renderNoResults()
      ) : (
        renderResults()
      )}
    </View>
  );
}

// Styles (Giữ nguyên)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: "600" },
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
    height: 48,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    fontSize: 16
  },
  filterButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Recent Searches
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  recentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  recentText: {
    fontSize: 16,
    color: "#555",
  },

  // No Results
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
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

  // Results
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  resultImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  resultDetails: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "500",
  },
  resultPrice: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
});