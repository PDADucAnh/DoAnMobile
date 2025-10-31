// app/_layout.tsx
import { Stack } from "expo-router";
import { UserProvider } from "./UserContext"; // chắc chắn tạo file UserContext.tsx như hướng dẫn trước đó

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </UserProvider>
  );
}
