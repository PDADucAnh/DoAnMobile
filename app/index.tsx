// app/index.tsx

import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function GetStartedScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Hình ảnh minh hoạ */}
      <Image
        source={require("../assets/images/Image1.png")}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Text */}
      <Text style={styles.title}>Define yourself in your unique way.</Text>

      {/* Nút Get Started */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/signup")}
      >
        <Text style={styles.buttonText}>Get Started →</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between",
    padding: 20,
  },
  image: { width: "100%", height: 400, borderRadius: 10 },
  title: { fontSize: 28, fontWeight: "bold", marginVertical: 20 },
  button: {
    backgroundColor: "black",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "600" },
});
