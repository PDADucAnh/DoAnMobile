import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function PlaceholderScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông Báo</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Nội dung */}
      <View style={styles.content}>
        <Ionicons name="build-outline" size={100} color="#b0b0b0" />
        <Text style={styles.title}>Chức Năng Đang Phát Triển</Text>
        <Text style={styles.subtitle}>
          Chúng tôi đang làm việc chăm chỉ để sớm mang tính năng này đến
          cho bạn. Vui lòng quay lại sau!
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Quay Về</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 50, // Đẩy nội dung lên trên
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});