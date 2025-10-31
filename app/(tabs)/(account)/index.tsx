// // app/(account)/index.tsx
// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { useRouter } from "expo-router";

// const accountOptions = [
//   { id: "1", title: "My Orders", icon: "cube-outline", route: "/orders" },
//   { id: "2", title: "My Details", icon: "person-outline", route: "/details" },
//   { id: "3", title: "Address Book", icon: "home-outline", route: "/address" },
//   {
//     id: "4",
//     title: "Payment Methods",
//     icon: "card-outline",
//     route: "/payment",
//   },
//   {
//     id: "5",
//     title: "Notifications",
//     icon: "notifications-outline",
//     route: "/notifications",
//   },
//   { id: "6", title: "FAQs", icon: "help-circle-outline", route: "/faqs" },
//   { id: "7", title: "Help Center", icon: "headset-outline", route: "/help" },
// ];

// export default function AccountScreen() {
//   const router = useRouter();

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={24} color="#000" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Account</Text>
//         <TouchableOpacity>
//           <Ionicons name="notifications-outline" size={24} color="#000" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
//         {accountOptions.map((item) => (
//           <TouchableOpacity
//             key={item.id}
//             style={styles.row}
//             onPress={() => router.push("/(account)/orders")}
//                       >
//             <View style={styles.rowLeft}>
//               <Ionicons name={item.icon} size={22} color="#000" />
//               <Text style={styles.rowText}>{item.title}</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#aaa" />
//           </TouchableOpacity>
//         ))}
//         {/* Logout */}
//         <TouchableOpacity
//           style={styles.row}
//           onPress={() => alert("Logged out")}
//         >
//           <View style={styles.rowLeft}>
//             <Ionicons name="log-out-outline" size={22} color="red" />
//             <Text style={[styles.rowText, { color: "red" }]}>Logout</Text>
//           </View>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: 15,
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//     backgroundColor: "#fff",
//   },
//   headerTitle: { fontSize: 16, fontWeight: "600" },

//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 16,
//     paddingHorizontal: 15,
//     borderBottomWidth: 1,
//     borderColor: "#f0f0f0",
//   },
//   rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
//   rowText: { fontSize: 15, fontWeight: "500" },
// });
// app/(account)/index.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";

const accountOptions = [
  { id: "1", title: "My Orders", icon: "cube-outline", route: "/orders" },
  { id: "2", title: "My Details", icon: "person-outline", route: "/details" },
  { id: "3", title: "Address Book", icon: "home-outline", route: "/address" },
  { id: "4", title: "Payment Methods", icon: "card-outline", route: "/payment" },
  { id: "5", title: "Notifications", icon: "notifications-outline", route: "/notifications" },
  { id: "6", title: "FAQs", icon: "help-circle-outline", route: "/faqs" },
  { id: "7", title: "Help Center", icon: "headset-outline", route: "/help" },
];

export default function AccountScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // Xóa dữ liệu người dùng (nếu có dùng AsyncStorage)
    // await AsyncStorage.removeItem("user");

    // Điều hướng về login
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        {accountOptions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.row}
            onPress={() => router.push(item.route as any)}
          >
            <View style={styles.rowLeft}>
              <Ionicons name={item.icon} size={22} color="#000" />
              <Text style={styles.rowText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.row} onPress={handleLogout}>
          <View style={styles.rowLeft}>
            <Ionicons name="log-out-outline" size={22} color="red" />
            <Text style={[styles.rowText, { color: "red" }]}>Logout</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 16, fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowText: { fontSize: 15, fontWeight: "500" },
});
