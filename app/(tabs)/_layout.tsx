import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react"; // Đảm bảo React được import

// Component Icon tab - Sửa để chấp nhận 'size' và dùng nó
const TabBarIcon = ({
  name,
  color,
  size, // 1. CHẮC CHẮN NHẬN SIZE
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  size: number; // Đảm bảo size là kiểu number
}) => {
  return <Ionicons name={name} size={size} color={color} />; // 2. CHẮC CHẮN SỬ DỤNG SIZE
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "black", // Đã sửa
        tabBarInactiveTintColor: "gray", // Đã sửa
      }}
    >
      <Tabs.Screen
        name="(home)/index" // Khớp với cấu trúc thư mục cũ của bạn
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(search)/index" // Khớp với cấu trúc thư mục cũ của bạn
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="search-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* Cập nhật tab AI Chat */}
      <Tabs.Screen
        name="(chatAI)/index" // Tên thư mục mới của bạn
        options={{
          title: "AI Chat", // Tên hiển thị
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="chatbubble-ellipses-outline" size={size} color={color} /> // Icon mới
          ),
        }}
      />

      <Tabs.Screen
        name="(cart)/index" // Khớp với cấu trúc thư mục cũ của bạn
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="cart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(account)/index" // Khớp với cấu trúc thư mục cũ của bạn
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}