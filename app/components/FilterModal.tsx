import React, { useState, useMemo, useEffect } from "react"; // 1. Thêm useMemo, useEffect
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

// 2. Định nghĩa kiểu Product (để nhận prop)
interface Product {
  price: number;
  specialPrice?: number;
}

// Định nghĩa các lựa chọn Lọc
export interface FilterOptions {
  sortBy: "Relevance" | "Price: Low - High" | "Price: High - Low";
  priceRange: [number, number];
  size: string | null;
}

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  products: Product[]; // 3. Nhận danh sách products
}

const MIN_PRICE = 0;

// 4. Hàm làm tròn số
const roundUpToNextSignificant = (num: number) => {
  if (num <= 100000) return 100000; // Mức sàn 100k
  const len = Math.floor(num).toString().length;
  // Làm tròn lên hàng trăm nghìn (nếu giá 545k -> 600k)
  if (len <= 6) { 
    const factor = Math.pow(10, len - 1); 
    return Math.ceil(num / factor) * factor;
  }
  // Làm tròn lên hàng triệu (nếu giá 5.4M -> 6M)
  if (len <= 7) { 
    const factor = Math.pow(10, len - 1);
    return Math.ceil(num / factor) * factor;
  }
  // Làm tròn lên hàng chục triệu (nếu giá 54M -> 60M)
  if (len <= 8) {
    const factor = Math.pow(10, len - 1);
    return Math.ceil(num / factor) * factor;
  }
  // Mặc định 1 tỷ
  return 1000000000;
};

export default function FilterModal({
  isVisible,
  onClose,
  onApply,
  products, // 5. Nhận prop
}: FilterModalProps) {
  
  // 6. Tính toán maxPrice động
  const dynamicMaxPrice = useMemo(() => {
    if (products && products.length > 0) {
      const actualMax = Math.max(
        ...products.map(p => p.specialPrice ?? p.price)
      );
      return roundUpToNextSignificant(actualMax);
    }
    return 1000000; // Mặc định 1 triệu nếu không có sản phẩm
  }, [products]); // Tính lại khi 'products' thay đổi

  const [sortBy, setSortBy] =
    useState<FilterOptions["sortBy"]>("Relevance");
  
  // 7. Dùng dynamicMaxPrice để khởi tạo state
  const [priceValues, setPriceValues] = useState([MIN_PRICE, dynamicMaxPrice]);

  // 8. Cập nhật state nếu modal mở ra với danh sách products mới
  useEffect(() => {
    if (isVisible) {
      setPriceValues([MIN_PRICE, dynamicMaxPrice]);
    }
  }, [isVisible, dynamicMaxPrice]);


  const handleApply = () => {
    onApply({
      sortBy: sortBy,
      priceRange: [priceValues[0], priceValues[1]],
      size: null, 
    });
    onClose();
  };

  const SortButton = ({
    title,
  }: {
    title: FilterOptions["sortBy"];
  }) => (
    <TouchableOpacity
      style={[styles.sortButton, sortBy === title && styles.sortButtonActive]}
      onPress={() => setSortBy(title)}
    >
      <Text
        style={[styles.sortText, sortBy === title && styles.sortTextActive]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filters</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Sort By */}
          <Text style={styles.filterSectionTitle}>Sort By</Text>
          <View style={styles.sortRow}>
            <SortButton title="Relevance" />
            <SortButton title="Price: Low - High" />
            <SortButton title="Price: High - Low" />
          </View>

          {/* Price Range (Với MultiSlider) */}
          <View style={styles.priceHeader}>
            <Text style={styles.filterSectionTitle}>Price</Text>
            <Text style={styles.priceRangeText}>
              {priceValues[0].toLocaleString("vi-VN")} - {priceValues[1].toLocaleString("vi-VN")} VND
            </Text>
          </View>
          
          {/* MultiSlider Component */}
          <View style={styles.sliderContainer}>
            <MultiSlider
              values={priceValues} // Dùng state
              onValuesChange={(values) => setPriceValues(values)}
              min={MIN_PRICE}
              max={dynamicMaxPrice} // 9. Dùng max động
              step={1000} 
              minMarkerOverlapDistance={0} 
              allowOverlap={false}
              
              trackStyle={styles.sliderTrack}
              selectedStyle={styles.sliderSelected}
              markerStyle={styles.sliderMarker}
              pressedMarkerStyle={styles.sliderMarkerPressed}
            />
          </View>

          {/* Size */}
          <Text style={styles.filterSectionTitle}>Size</Text>
          <TouchableOpacity style={styles.sizeRow}>
            <Text style={styles.sizeText}>L</Text>
            <Ionicons name="chevron-down" size={20} color="#555" />
          </TouchableOpacity>

          {/* Nút Apply */}
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

// Styles (Giữ nguyên)
const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "65%", // Giữ chiều cao
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
  },
  sortRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sortButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sortButtonActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  sortText: {
    fontSize: 14,
    color: "#000",
  },
  sortTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  priceRangeText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  // Style cho Slider
  sliderContainer: {
    alignItems: "center", // Cần thiết để căn giữa slider
    marginTop: 10,
  },
  sliderTrack: {
    height: 3,
    backgroundColor: '#ddd',
  },
  sliderSelected: {
    backgroundColor: '#000',
  },
  sliderMarker: {
    height: 20,
    width: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
  },
  sliderMarkerPressed: {
    height: 24,
    width: 24,
    borderRadius: 12,
  },
  // Style cho Size
  sizeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20, // Thêm khoảng đệm
  },
  sizeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  applyButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});