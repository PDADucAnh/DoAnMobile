import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  TextInputProps, // 1. IMPORT THÊM TextInputProps
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GET_ID, PUT_EDIT } from "../../APIService";

// Lấy validation từ Address.java
const VALIDATION_RULES = {
  buildingName: 5, // Dùng làm Nickname
  street: 5,
  city: 4,
  state: 2,
  country: 2,
  pincode: 6,
};

// ===================================
// BẮT ĐẦU SỬA LỖI
// ===================================

// 1. Định nghĩa Interface (giữ nguyên)
interface FormInputProps extends Omit<TextInputProps, 'onChange'> {
  label: string;
  value: string;
  onChange: (text: string) => void; 
  error: string | null;
}

// 2. DI CHUYỂN 'FormInput' ra bên ngoài 'AddAddressScreen'
const FormInput = ({ label, value, onChange, error, ...props }: FormInputProps) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      value={value}
      onChangeText={onChange} // Prop 'onChange' được dùng làm 'onChangeText'
      placeholder={label}
      placeholderTextColor="#aaa"
      {...props} // Truyền các props còn lại (keyboardType, maxLength)
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// ===================================
// KẾT THÚC SỬA LỖI
// ===================================

export default function AddAddressScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // State cho 6 trường backend yêu cầu
  const [buildingName, setBuildingName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");
  
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  // Hàm validate
  const validate = (): boolean => {
    let newErrors: { [key: string]: string | null } = {};
    let isValid = true;
    
    if (buildingName.length < VALIDATION_RULES.buildingName) {
      newErrors.buildingName = `Nickname must be at least ${VALIDATION_RULES.buildingName} chars`;
      isValid = false;
    }
    if (street.length < VALIDATION_RULES.street) {
      newErrors.street = `Street must be at least ${VALIDATION_RULES.street} chars`;
      isValid = false;
    }
    if (city.length < VALIDATION_RULES.city) {
      newErrors.city = `City must be at least ${VALIDATION_RULES.city} chars`;
      isValid = false;
    }
    if (state.length < VALIDATION_RULES.state) {
      newErrors.state = `State must be at least ${VALIDATION_RULES.state} chars`;
      isValid = false;
    }
    if (country.length < VALIDATION_RULES.country) {
      newErrors.country = `Country must be at least ${VALIDATION_RULES.country} chars`;
      isValid = false;
    }
     if (pincode.length < VALIDATION_RULES.pincode) {
      newErrors.pincode = `Pincode must be at least ${VALIDATION_RULES.pincode} chars`;
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleAddAddress = async () => {
    if (!validate()) {
      return; // Dừng nếu validation thất bại
    }
    
    setLoading(true);
    try {
      // 1. Lấy email và userId
      const email = await AsyncStorage.getItem("user-email");
      const userId = await AsyncStorage.getItem("userId");
      if (!email || !userId) throw new Error("User not found");

      // 2. Lấy thông tin user hiện tại (để giữ các trường khác)
      const userRes = await GET_ID("public/users/email", email);
      const currentUserDTO = userRes.data;
      // const currentAddresses = currentUserDTO.addresses || []; // << Không cần dòng này nữa

      // ===================================
      // BẮT ĐẦU SỬA LỖI
      // ===================================

      // 3. Tạo đối tượng địa chỉ mới (số ít)
      const newAddress = {
        street,
        buildingName, // Dùng buildingName cho "Nickname"
        city,
        state,
        country,
        pincode,
      };

      // 4. Tạo DTO user mới (chỉ gửi 'address', không gửi 'addresses')
      //    Điều này khớp với logic `userDTO.getAddress()` trong `UserServiceImpl.java`
      const updatedUserDTO = {
        ...currentUserDTO,
        address: newAddress, // <--- SỬA LỖI Ở ĐÂY
        // addresses: [...currentAddresses, newAddress], // <<<< XÓA DÒNG NÀY
      };

      // ===================================
      // KẾT THÚC SỬA LỖI
      // ===================================

      // 5. Gọi PUT update user
      await PUT_EDIT(`public/users/${userId}`, updatedUserDTO);

      setLoading(false);
      setShowSuccessModal(true); // Hiển thị modal thành công

    } catch (err) {
      setLoading(false);
      console.error("Lỗi khi thêm địa chỉ:", err);
      Alert.alert("Error", "Could not add address. Please try again.");
    }
  };

  // 3. Component FormInput đã được dời ra BÊN NGOÀI

  return (
    <View style={styles.container}>
      {/* Modal Chúc Mừng (Ảnh 4) */}
      <Modal visible={showSuccessModal} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#28a745" />
            <Text style={styles.modalTitle}>Congratulations!</Text>
            <Text style={styles.modalSubtitle}>
              Your new address has been added.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => router.back()} // Quay lại
            >
              <Text style={styles.modalButtonText}>Thanks</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Address</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Map (Placeholder) */}
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={100} color="#ccc" />
      </View>

      {/* Form (Modal Sheet) */}
      <View style={styles.formContainer}>
        <View style={styles.handleBar} />
        <ScrollView>
          <Text style={styles.formTitle}>Address</Text>
          
          {/* Thay thế "Nickname" và "Full Address" bằng 6 trường */}
          <FormInput
            label="Address Nickname (e.g., Home, Office)"
            value={buildingName}
            onChange={setBuildingName}
            error={errors.buildingName}
          />
          <FormInput
            label="Street"
            value={street}
            onChange={setStreet}
            error={errors.street}
          />
           <FormInput
            label="City"
            value={city}
            onChange={setCity}
            error={errors.city}
          />
           <FormInput
            label="State"
            value={state}
            onChange={setState}
            error={errors.state}
          />
           <FormInput
            label="Country"
            value={country}
            onChange={setCountry}
            error={errors.country}
          />
           <FormInput
            label="Pincode"
            value={pincode}
            onChange={setPincode}
            error={errors.pincode}
            keyboardType="numeric"
            maxLength={6}
          />
          
          <TouchableOpacity style={styles.addButton} onPress={handleAddAddress} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>Add</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e9e9e9",
  },
  formContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#dc3545", // Màu đỏ
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 3,
  },
  addButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});