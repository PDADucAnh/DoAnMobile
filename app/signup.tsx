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
import { POST_ADD } from "../APIService";

export default function SignupScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password || !mobileNumber) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const newUser = {
      userId: 0,
      firstName,
      lastName,
      mobileNumber,
      email,
      password,
      roles: [
        {
          roleId: 101,
          roleName: "user",
        },
      ],
      address: {
        addressId: 0,
        street: "string",
        buildingName: "string",
        city: "string",
        state: "string",
        country: "string",
        pincode: "string",
      },
      cart: {
        cartId: 0,
        totalPrice: 0,
        products: [],
      },
    };

    try {
      const response = await POST_ADD("register", newUser);
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Thành công", "Đăng ký thành công!");
        router.push("/login");
      } else {
        Alert.alert("Lỗi", "Đăng ký thất bại, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Lỗi", "Không thể kết nối tới máy chủ.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an account</Text>
      <Text style={styles.subtitle}>Let’s create your account.</Text>

      <TextInput
        placeholder="First Name"
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        placeholder="Last Name"
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        placeholder="Mobile Number"
        style={styles.input}
        value={mobileNumber}
        onChangeText={setMobileNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupText}>Create an Account</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Already have an account?{" "}
        <Text style={{ color: "blue" }} onPress={() => router.push("/login")}>
          Log In
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginTop: 50 },
  subtitle: { fontSize: 16, color: "gray", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  signupButton: {
    backgroundColor: "black",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  signupText: { color: "white", fontSize: 16, fontWeight: "600" },
  footerText: { textAlign: "center", marginTop: 20, color: "gray" },
});
