// app/(pay)/index.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";

interface Card {
  id: string;
  type: string;
  number: string;
  default?: boolean;
}

export default function PayScreen() {
  const router = useRouter();

  const [cards, setCards] = useState<Card[]>([
    { id: "1", type: "VISA", number: "2512", default: true },
    { id: "2", type: "MASTERCARD", number: "5421" },
    { id: "3", type: "VISA", number: "2512" },
  ]);

  const [selectedId, setSelectedId] = useState("1");

  const addNewCard = () => {
    alert("Chức năng thêm thẻ mới (Add New Card) chưa được triển khai!");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <Ionicons name="notifications-outline" size={22} color="#000" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 15 }}>
        <Text style={styles.sectionTitle}>Saved Cards</Text>

        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.cardItem,
              selectedId === card.id && styles.cardItemSelected,
            ]}
            onPress={() => setSelectedId(card.id)}
          >
            <View style={styles.cardLeft}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardBrand}>{card.type}</Text>
              </View>
              <Text style={styles.cardNumber}>**** **** **** {card.number}</Text>
              {card.default && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>

            <Ionicons
              name={
                selectedId === card.id
                  ? "radio-button-on-outline"
                  : "radio-button-off-outline"
              }
              size={22}
              color="#000"
            />
          </TouchableOpacity>
        ))}

        {/* Add new card */}
        <TouchableOpacity style={styles.addCardBtn} onPress={addNewCard}>
          <Ionicons name="add-outline" size={20} color="#000" />
          <Text style={styles.addCardText}>Add New Card</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom button */}
      <TouchableOpacity style={styles.applyBtn}>
        <Text style={styles.applyText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerTitle: { fontSize: 16, fontWeight: "600" },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginVertical: 10,
    color: "#333",
  },

  cardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardItemSelected: { borderColor: "#000" },

  cardLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardIcon: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  cardBrand: { fontWeight: "700", color: "#000" },
  cardNumber: { fontSize: 14, fontWeight: "500" },
  defaultBadge: {
    backgroundColor: "#eee",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
  },
  defaultText: { fontSize: 10, fontWeight: "600", color: "#555" },

  addCardBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
    backgroundColor: "#fafafa",
  },
  addCardText: { fontWeight: "600", fontSize: 14, marginLeft: 6 },

  applyBtn: {
    backgroundColor: "#000",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 20,
  },
  applyText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
