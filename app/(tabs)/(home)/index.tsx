// import { useRouter } from "expo-router";
// import React, { useEffect, useState } from "react";
// import {
//   FlatList,
//   Image,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   ActivityIndicator,
// } from "react-native";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { GET_ALL, GET_IMG } from "../../../APIService";

// interface Product {
//   productId: number;
//   productName?: string;
//   price: number;
//   specialPrice?: number;
//   image: string;
//   category: { categoryId: number; categoryName: string };
//   description?: string;
// }

// interface Category {
//   categoryId: number;
//   categoryName: string;
// }

// export default function HomeScreen() {
//   const router = useRouter();
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState<number | null>(0);
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await GET_ALL(
//           "public/categories?pageNumber=0&pageSize=10&sortBy=categoryId&sortOrder=asc"
//         );
//         setCategories(res.data.content || []);
//       } catch (error) {
//         console.error("Error fetching categories:", error);
//       }
//     };
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const endpoint =
//           selectedCategory && selectedCategory !== 0
//             ? `public/categories/${selectedCategory}/products?pageNumber=0&pageSize=50&sortBy=productId&sortOrder=asc`
//             : "public/products?pageNumber=0&pageSize=50&sortBy=productId&sortOrder=asc";

//         const res = await GET_ALL(endpoint);
//         const data = res.data.content || [];
//         setProducts(data);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProducts();
//   }, [selectedCategory]);

//   const filteredProducts = products.filter((p) =>
//     (p.productName || "").toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="black" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Discover</Text>
//         <Ionicons name="notifications-outline" size={24} color="#000" />
//       </View>

//       {/* Search */}
//       <View style={styles.searchBar}>
//         <Ionicons name="search-outline" size={20} color="#888" />
//         <TextInput
//           placeholder="Search for products..."
//           placeholderTextColor="#888"
//           style={styles.searchInput}
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//         />
//       </View>

//       {/* Categories */}
//       <View style={styles.categoryContainer}>
//         <FlatList
//           horizontal
//           data={[{ categoryId: 0, categoryName: "All" }, ...categories]}
//           renderItem={({ item }) => {
//             const isActive = selectedCategory === item.categoryId;
//             return (
//               <TouchableOpacity
//                 style={[
//                   styles.categoryButton,
//                   isActive ? styles.categoryButtonActive : null,
//                 ]}
//                 onPress={() => setSelectedCategory(item.categoryId)}
//               >
//                 <Text
//                   style={[
//                     styles.categoryText,
//                     isActive ? styles.categoryTextActive : null,
//                   ]}
//                 >
//                   {item.categoryName}
//                 </Text>
//               </TouchableOpacity>
//             );
//           }}
//           keyExtractor={(item) => item.categoryId.toString()}
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.categoryList}
//         />
//       </View>

//       {/* Product list */}
//       <FlatList
//         data={filteredProducts}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             style={styles.card}
//             onPress={() => router.push(`/(product)/${item.productId}`)}
//           >
//             <Image
//               source={{ uri: GET_IMG("products", item.image) }}
//               style={styles.image}
//               resizeMode="cover"
//             />
//             <Text style={styles.title}>{item.productName || "No Name"}</Text>
//             <Text style={styles.categoryName}>
//               {item.category?.categoryName || "Uncategorized"}
//             </Text>
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               {item.specialPrice != null &&
//                 item.specialPrice !== item.price && (
//                   <Text style={styles.oldPrice}>${item.specialPrice}</Text>
//                 )}
//               <Text style={styles.price}>${item.price}</Text>
//             </View>
//           </TouchableOpacity>
//         )}
//         keyExtractor={(item) => item.productId.toString()}
//         numColumns={2}
//         contentContainerStyle={styles.list}
//         showsVerticalScrollIndicator={false}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", paddingTop: 50 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingHorizontal: 15,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   headerTitle: { fontSize: 22, fontWeight: "bold" },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f5f5f5",
//     borderRadius: 10,
//     marginHorizontal: 15,
//     paddingHorizontal: 10,
//     marginBottom: 10,
//   },
//   searchInput: { flex: 1, padding: 8 },

//   categoryContainer: {
//     marginBottom: 10,
//   },
//   categoryList: {
//     paddingHorizontal: 10,
//     alignItems: "center",
//   },
//   categoryButton: {
//     backgroundColor: "#f0f0f0",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     marginRight: 8,
//     minWidth: 80,
//     alignItems: "center",
//   },
//   categoryButtonActive: {
//     backgroundColor: "#000",
//   },
//   categoryText: {
//     fontSize: 14,
//     color: "#000",
//     textAlign: "center",
//   },
//   categoryTextActive: {
//     color: "#fff",
//     fontWeight: "600",
//   },

//   list: { paddingHorizontal: 10, paddingBottom: 70 },
//   card: {
//     flex: 1,
//     backgroundColor: "#fff",
//     margin: 8,
//     borderRadius: 10,
//     padding: 10,
//     elevation: 2,
//   },
//   image: { width: "100%", height: 150, borderRadius: 10, marginBottom: 8 },
//   title: { fontSize: 14, fontWeight: "600", marginBottom: 5 },
//   categoryName: { fontSize: 12, color: "#666", marginBottom: 5 },
//   price: { fontSize: 14, fontWeight: "bold", color: "#000" },
//   oldPrice: {
//     fontSize: 12,
//     color: "gray",
//     textDecorationLine: "line-through",
//     marginRight: 5,
//   },
// });
//===============================================
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { GET_ALL, GET_IMG } from "../../../APIService";

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
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const endpoint =
          selectedCategory && selectedCategory !== 0
            ? `public/categories/${selectedCategory}/products?pageNumber=0&pageSize=50&sortBy=productId&sortOrder=asc`
            : "public/products?pageNumber=0&pageSize=50&sortBy=productId&sortOrder=asc";

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
  }, [selectedCategory]);

  const filteredProducts = products.filter((p) =>
    (p.productName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Ionicons name="notifications-outline" size={24} color="#000" />
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#888" />
        <TextInput
          placeholder="Search for products..."
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
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
        data={filteredProducts}
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

            {/* =============================================
            BẮT ĐẦU SỬA LỖI HIỂN THỊ GIÁ
            =============================================
            */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* Điều kiện: CHỈ hiển thị giá cũ (gạch ngang)
                NẾU có giá đặc biệt (specialPrice) TỒN TẠI
                VÀ nó KHÁC với giá gốc
              */}
              {item.specialPrice != null &&
                item.specialPrice !== item.price && (
                  // Giá cũ (item.price) sẽ bị gạch ngang
                  <Text style={styles.oldPrice}>${item.price}</Text>
                )}

              {/* Hiển thị giá chính:
                - Nếu item.specialPrice tồn tại (không null/undefined), hiển thị nó.
                - Nếu không, hiển thị item.price (giá gốc).
              */}
              <Text style={styles.price}>
                ${item.specialPrice ?? item.price}
              </Text>
            </View>
            {/* =============================================
            KẾT THÚC SỬA LỖI
            =============================================
            */}
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

// Giữ nguyên toàn bộ styles
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginHorizontal: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: { flex: 1, padding: 8 },

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