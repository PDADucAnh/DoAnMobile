import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosResponse } from "axios";

// Cấu hình URL gốc của API (thay đổi IP tùy theo máy backend)
export const BASE_URL = "http://172.16.2.176";

// =============================================
// SERVER 1: JAVA/SPRING BOOT (Port 8080)
// =============================================
const API_URL = `${BASE_URL}:8080/api`;

// =============================================
// SERVER 2: NODE.JS (Port 3000 - Gemini/VNPay)
// =============================================
const NODE_API_URL = `${BASE_URL}:3000`; // Không có /api


// Hàm lấy JWT token từ AsyncStorage
async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem("jwt-token");
}

// Hàm gọi API chung (cho Server 8080)
export async function callApi(
  endpoint: string,
  method: string,
  data: any = null
): Promise<AxiosResponse<any>> {
  const token = await getToken();
  console.log(`[callApi JAVA 8080] Gửi request ${method} đến ${endpoint} với Token:`, token);
  try {
    return await axios({
      method,
      url: `${API_URL}/${endpoint}`,
      data,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  } catch (error: any) {
    console.error(
      `API error [${method} ${endpoint}]:`,
      error?.response?.data || error.message
    );
    throw error;
  }
}

// =============================================
// HÀM MỚI ĐỂ GỌI SERVER NODE.JS (Port 3000)
// =============================================
async function callNodeApi(
  endpoint: string,
  method: string,
  data: any = null
): Promise<AxiosResponse<any>> {
  
  // Lấy email cho server Node
  const email = await AsyncStorage.getItem("user-email");
  
  console.log(`[callApi NODE 3000] Gửi request ${method} đến ${endpoint}`);
  
  try {
    // Thêm email vào data để gửi đi (dựa theo code server.js)
    const body = {
      ...data,
      email: email, 
    };

    return await axios({
      method,
      url: `${NODE_API_URL}/${endpoint}`, // Dùng URL của Node
      data: body,
      headers: {
        "Content-Type": "application/json",
        // Server Node /ask-gemini không cần JWT token
      },
    });
  } catch (error: any) {
    console.error(
      `NODE API error [${method} ${endpoint}]:`,
      error?.response?.data || error.message
    );
    throw error;
  }
}

// Lấy toàn bộ dữ liệu (vẫn dùng callApi 8080)
export function GET_ALL(endpoint: string): Promise<AxiosResponse<any>> {
  return callApi(endpoint, "GET");
}

// Lấy dữ liệu có phân trang (vẫn dùng callApi 8080)
export function GET_PAGE(
  endpoint: string,
  page: number = 0,
  size: number = 10,
  categoryId: string | null = null
): Promise<AxiosResponse<any>> {
  let url = `${endpoint}?page=${page}&size=${size}`;
  if (categoryId !== null) {
    url += `&categoryId=${categoryId}`;
  }
  return callApi(url, "GET");
}

// Lấy dữ liệu theo ID (vẫn dùng callApi 8080)
export function GET_ID(
  endpoint: string,
  id: string | number
): Promise<AxiosResponse<any>> {
  return callApi(`${endpoint}/${id}`, "GET");
}

// Thêm mới dữ liệu (vẫn dùng callApi 8080)
export async function POST_ADD(
  endpoint: string,
  data: any
): Promise<AxiosResponse<any>> {
  if (endpoint === "register" || endpoint === "login") {
    return await axios.post(`${API_URL}/${endpoint}`, data, {
      headers: { "Content-Type": "application/json" },
    });
  }
  return callApi(endpoint, "POST", data);
}

// Cập nhật dữ liệu (vẫn dùng callApi 8080)
export function PUT_EDIT(
  endpoint: string,
  data: any
): Promise<AxiosResponse<any>> {
  return callApi(endpoint, "PUT", data);
}

// Xóa dữ liệu theo ID (vẫn dùng callApi 8080)
export function DELETE_ID(
  endpoint: string,
  id: string | number
): Promise<AxiosResponse<any>> {
  return callApi(`${endpoint}/${id}`, "DELETE");
}

// Lấy hình ảnh theo tên file (vẫn dùng callApi 8080)
export function GET_IMG(endpoint: string, imgName: string): string {
  return `${API_URL}/public/${endpoint}/image/${imgName}`;
}

// Đăng nhập (vẫn dùng callApi 8080)
export async function POST_LOGIN(
  email: string,
  password: string
): Promise<boolean> {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const token = response.data["jwt-token"];

    if (token) {
      await AsyncStorage.setItem("jwt-token", token);
      await AsyncStorage.setItem("user-email", email);

      const userResponse = await GET_ID(
        `public/users/email`,
        encodeURIComponent(email)
      );

      const cartId = userResponse.data.cart?.cartId;
      if (cartId) {
        await AsyncStorage.setItem("cart-id", String(cartId));
      }

      console.log("Login successful for:", email);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
}

/* =========================
   API GIỎ HÀNG (vẫn dùng 8080)
   ========================= */

// Lấy giỏ hàng của người dùng
export async function GET_CART(
  email: string,
  cartId: string
): Promise<AxiosResponse<any>> {
  return callApi(`public/users/${email}/carts/${cartId}`, "GET");
}

export async function UPDATE_CART_QUANTITY(
  cartId: string,
  productId: number,
  quantity: number
): Promise<AxiosResponse<any>> {
  const qty = Number(quantity);
  const apiUrl = `public/carts/${cartId}/products/${productId}/quantity/${qty}`;
  return callApi(
    apiUrl,
    "PUT",
    null // Gửi body rỗng (null)
  );
}

export async function DELETE_CART_PRODUCT(
  cartId: string,
  productId: number
): Promise<AxiosResponse<any>> {
  return callApi(`public/carts/${cartId}/product/${productId}`, "DELETE");
}

/* =========================
   API GEMINI (SỬA LẠI ĐỂ GỌI NODE 3000)
   ========================= */

export async function POST_TO_GEMINI(
  prompt: string
): Promise<AxiosResponse<any>> {
  // "ask-gemini" là endpoint bạn vừa tạo ở server.js
  // 
  // ⬇️⬇️⬇️ SỬA LỖI: Dùng hàm callNodeApi mới ⬇️⬇️⬇️
  //
  return callNodeApi("ask-gemini", "POST", { prompt: prompt });
}