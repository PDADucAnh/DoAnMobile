import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import GeminiAssistant from "../../components/GeminiAssistant";
import { Stack } from "expo-router";

export default function AiChatTabScreen() {
  return (
    // Dùng SafeAreaView để tránh tai thỏ (notch)
    <SafeAreaView style={styles.container}>
      {/* Ẩn Header mặc định của tab này */}
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Tải component chat của bạn */}
      <GeminiAssistant />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Đặt màu nền trắng
  },
});