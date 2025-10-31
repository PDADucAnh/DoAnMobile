import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosResponse } from "axios";

// Cấu hình URL gốc của API (thay đổi IP tùy theo máy backend)
const BASE_URL = "http://192.168.1.34:8080";
const API_URL = `${BASE_URL}/api`;
// Hàm lấy JWT token từ AsyncStorage
async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem("jwt-token");
}

// Hàm gọi API chung
export async function callApi(
  endpoint: string,
  method: string,
  data: any = null
): Promise<AxiosResponse<any>> {
  const token = await getToken();

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
    console.error(`API error [${method} ${endpoint}]:`, error?.response?.data || error.message);
    throw error;
  }}

// Lấy toàn bộ dữ liệu
export function GET_ALL(endpoint: string): Promise<AxiosResponse<any>> {
  return callApi(endpoint, "GET");
}

// Lấy dữ liệu có phân trang và lọc theo categoryId
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

// Lấy dữ liệu theo ID
export function GET_ID(
  endpoint: string,
  id: string | number
): Promise<AxiosResponse<any>> {
  return callApi(`${endpoint}/${id}`, "GET");
}

// Thêm mới dữ liệu
export function POST_ADD(
  endpoint: string,
  data: any
): Promise<AxiosResponse<any>> {
  return callApi(endpoint, "POST", data);
}

// Cập nhật dữ liệu
export function PUT_EDIT(
  endpoint: string,
  data: any
): Promise<AxiosResponse<any>> {
  return callApi(endpoint, "PUT", data);
}

// Xóa dữ liệu theo ID
export function DELETE_ID(
  endpoint: string,
  id: string | number
): Promise<AxiosResponse<any>> {
  return callApi(`${endpoint}/${id}`, "DELETE");
}

// Lấy hình ảnh theo tên file
export function GET_IMG(endpoint: string, imgName: string): string {
  return `${API_URL}/public/${endpoint}/image/${imgName}`;
}

// Đăng nhập và lưu token, email, cartId vào AsyncStorage
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

      // Lấy thông tin người dùng qua email
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
