import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
// Import hàm API bạn đã tạo
import { POST_TO_GEMINI } from "../../APIService"; 
import Ionicons from "@expo/vector-icons/Ionicons";

export default function GeminiAssistant() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAskGemini = async () => {
    if (!prompt.trim()) {
      setResponse("Vui lòng nhập câu hỏi.");
      return;
    }

    setIsLoading(true);
    setResponse(""); // Xóa câu trả lời cũ

    try {
      // Gọi API endpoint /ask-gemini trên server Node.js
      const result = await POST_TO_GEMINI(prompt);

      if (result.data && result.data.response) {
        setResponse(result.data.response);
      } else {
        setResponse("Không nhận được phản hồi từ AI.");
      }
    } catch (error: any) {
      console.error("Lỗi khi gọi Gemini:", error);
      setResponse("Lỗi: " + (error.message || "Không thể kết nối."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trợ lý AI</Text>
      <Text style={styles.subtitle}>
        Bạn có thể hỏi về đơn hàng hoặc sản phẩm...
      </Text>

      {/* Ô nhập câu hỏi */}
      <View style={styles.inputContainer}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#555" />
        <TextInput
          style={styles.input}
          placeholder="Hỏi AI: 'Tóm tắt 3 đơn hàng gần nhất?'"
          placeholderTextColor="#888"
          value={prompt}
          onChangeText={setPrompt}
        />
      </View>

      {/* Nút Gửi */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleAskGemini}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          // ==================================
          // SỬA LỖI 1, 2, 3 TẠI ĐÂY: </Gửi> -> </Text>
          // ==================================
          <Text style={styles.buttonText}>Gửi câu hỏi</Text>
        )}
      </TouchableOpacity>

      {/* Vùng kết quả */}
      {response ? (
        <View style={styles.responseContainer}>
          <Text style={styles.responseTitle}>Gemini trả lời:</Text>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      ) : null}
    </View>
  );
}

// Styles cho component Gemini (đã có từ trước)
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    margin: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  responseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  responseTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  responseText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
});