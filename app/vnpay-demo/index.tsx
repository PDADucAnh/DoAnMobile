import React from 'react';
import { ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '../UserContext';

export default function VnpayDemo() {
  const { amount } = useLocalSearchParams<{ amount: string }>();
  const { clearCart } = useUser(); // dùng hook useUser để lấy clearCart
  const router = useRouter();

  const vnpayUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?amount=${amount}&orderInfo=DemoOrder`;

  return (
    <WebView
      source={{ uri: vnpayUrl }}
      startInLoadingState
      renderLoading={() => <ActivityIndicator size="large" />}
      onNavigationStateChange={(navState) => {
        if (navState.url.includes('vnpay-return-url')) {
          const success = navState.url.includes('success');
          if (success && clearCart) clearCart(); // xóa giỏ hàng nếu thành công
          router.replace({
            pathname: '/payment-result', // sửa đường dẫn
            params: { success: success ? 'true' : 'false' },
          });
        }
      }}
    />
  );
}
