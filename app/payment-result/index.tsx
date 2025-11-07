// app/payment-result/index.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function PaymentResult() {
  const router = useRouter();
  const { status, orderId, amount, email } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {status === "success" ? "Thanh toán thành công !" : "Thanh toán thất bại !"}
      </Text>
      {status === "success" && (
        <>
          <Text style={styles.text}>Mã đơn hàng: {orderId}</Text>
          <Text style={styles.text}>Số tiền: {amount} VND</Text>
          <Text style={styles.text}>Email: {email}</Text>
        </>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/(tabs)/(cart)")}
      >
        <Text style={styles.buttonText}>Quay lại giỏ hàng</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 8 },
  button: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
