import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList, // 1. Dùng FlatList cho chat
  KeyboardAvoidingView,
  Platform,
} from "react-native";
// 2. Import hàm API mới
import { POST_TO_GEMINI, GET_CHAT_HISTORY } from "../../APIService"; 
import Ionicons from "@expo/vector-icons/Ionicons";

// 3. Định nghĩa kiểu tin nhắn
interface Message {
  id: string; // Dùng timestamp
  text: string;
  sender: "user" | "bot";
}

export default function GeminiAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // 4. Tải lịch sử chat khi component mở ra
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const res = await GET_CHAT_HISTORY();
        const history = (res.data || []).map((msg: any) => ({
          id: msg.timestamp.toString(),
          text: msg.message,
          sender: msg.sender,
        }));
        setMessages(history);
      } catch (error) {
        console.error("Lỗi tải lịch sử chat:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, []);

  // 5. Hàm gửi tin nhắn
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
    };

    // 6. Cập nhật UI ngay lập tức (Optimistic Update)
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Tự cuộn xuống
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);

    try {
      // 7. Gọi API (chỉ gửi prompt, server tự lưu)
      const res = await POST_TO_GEMINI(userMessage.text);
      
      if (res.data && res.data.response) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: res.data.response,
          sender: "bot",
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error("Phản hồi từ API không hợp lệ");
      }
    } catch (error: any) {
      console.error("Lỗi khi gọi Gemini:", error);
      // Trả lại tin nhắn lỗi
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Xin lỗi, tôi không thể trả lời lúc này.",
        sender: "bot",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  return (
    // 8. Dùng KeyboardAvoidingView để ô nhập không bị che
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100} // Điều chỉnh nếu cần
    >
      {/* Header (Bạn có thể giữ hoặc bỏ) */}
      <Text style={styles.title}>Trợ lý AI</Text>
      
      {/* 9. Vùng Chat (FlatList) */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.chatArea}
        contentContainerStyle={{ paddingBottom: 10 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender === "user" ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text
              style={item.sender === "user" ? styles.userText : styles.botText}
            >
              {item.text}
            </Text>
          </View>
        )}
        ListFooterComponent={isLoading ? <ActivityIndicator style={{margin: 10}} /> : null}
      />
      
      {/* 10. Ô Nhập liệu (Input Bar) */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Hỏi AI về đơn hàng của bạn..."
          placeholderTextColor="#888"
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity
          style={[styles.button, (isLoading || !input.trim()) && { opacity: 0.5 }]}
          onPress={handleSend}
          disabled={isLoading || !input.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// 11. Styles mới cho giao diện chat
const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 15,
    flex: 1, // Component này cần chiếm không gian
    minHeight: 450, // Đặt chiều cao tối thiểu
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  chatArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: "80%",
    marginVertical: 5,
    marginHorizontal: 10,
  },
  userBubble: {
    backgroundColor: "#000",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#e5e5e5",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: "#fff",
    fontSize: 15,
  },
  botText: {
    color: "#000",
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100, // Giới hạn chiều cao
    marginRight: 10,
  },
  button: {
    backgroundColor: "#000",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});