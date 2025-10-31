// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { POST_LOGIN, GET_ALL } from "../APIService";

// export default function LoginScreen() {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     if (!email || !password) {
//       Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu!");
//       return;
//     }

//     try {
//       setLoading(true);

//       // 🟢 Gọi API đăng nhập (dùng BASE_URL trong APIService)
//       const response = await POST_LOGIN({ email, password });

//       if (response.status === 200) {
//         Alert.alert("Thành công", "Đăng nhập thành công!");

//         // 🟡 (Tuỳ chọn) Gọi thử API GET_ALL để test token
//         try {
//           const products = await GET_ALL(
//             "public/products?pageNumber=0&pageSize=5&sortBy=productId&sortOrder=asc"
//           );

//           if (products?.data?.content?.length > 0) {
//             console.log("Products:", products.data.content);
//           } else {
//             console.log("Không có sản phẩm nào!");
//           }
//         } catch (err) {
//           console.error("Lỗi khi lấy sản phẩm:", err);
//           Alert.alert("Lỗi", "Không thể tải danh sách sản phẩm!");
//         }

//         // 🟢 Điều hướng sang trang chính
//         router.replace("/(tabs)");
//       } else {
//         Alert.alert("Lỗi", "Email hoặc mật khẩu không đúng!");
//       }
//     } catch (error) {
//       console.error("❌ Login error:", error);
//       Alert.alert("Lỗi", "Không thể kết nối tới máy chủ!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Đăng Nhập</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Nhập email"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//         autoCapitalize="none"
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Nhập mật khẩu"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />

//       <TouchableOpacity
//         style={[styles.button, loading && { opacity: 0.6 }]}
//         onPress={handleLogin}
//         disabled={loading}
//       >
//         <Text style={styles.buttonText}>
//           {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => router.push("/signup")}>
//         <Text style={styles.link}>Chưa có tài khoản? Đăng ký ngay</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 24,
//     justifyContent: "center",
//     backgroundColor: "#fff",
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "700",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 15,
//     fontSize: 16,
//   },
//   button: {
//     backgroundColor: "black",
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   buttonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   link: {
//     color: "#007BFF",
//     textAlign: "center",
//     marginTop: 10,
//   },
// });
///////////////////\
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { POST_LOGIN, GET_ID } from "../APIService";
import { useUser } from "./UserContext";
import { isAxiosError } from "axios";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu!");
      return;
    }

    setLoading(true);

    try {
      // Gọi hàm POST_LOGIN từ APIService (trả về true hoặc false)
      const isLoggedIn = await POST_LOGIN(email, password);

      if (isLoggedIn) {
        // Lấy token đã lưu
        const token = await AsyncStorage.getItem("jwt-token");

        // Lấy thông tin người dùng qua email
        const userResponse = await GET_ID(
          "public/users/email",
          encodeURIComponent(email)
        );

        // Cập nhật thông tin người dùng vào Context
        await login(userResponse.data, token ?? undefined);

        // Điều hướng sang màn hình chính
        router.replace("/(tabs)/(home)");
      } else {
        throw new Error("Email hoặc mật khẩu không chính xác.");
      }
    } catch (error) {
      console.error("Login error:", error);
      let message = "Tên đăng nhập hoặc mật khẩu không đúng.";

      if (isAxiosError(error)) {
        message =
          error.response?.data?.message || "Lỗi máy chủ, vui lòng thử lại.";
      } else if (error instanceof Error) {
        message = error.message;
      }

      Alert.alert("Đăng nhập thất bại", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Nhập</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Nhập mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.link}>Chưa có tài khoản? Đăng ký ngay</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    color: "#007BFF",
    textAlign: "center",
    marginTop: 10,
  },
});
