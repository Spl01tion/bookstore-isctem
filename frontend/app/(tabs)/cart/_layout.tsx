import { Stack } from 'expo-router'

export default function CartLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: '#f43f5e' },
      headerTitleStyle: { color: '#fff' },
      headerTitleAlign: 'left',
      headerBackButtonDisplayMode: 'minimal',
    }}>
      <Stack.Screen name="index" options={{ headerTitle: 'Giỏ hàng' }} />
      <Stack.Screen name="order" options={{ headerTitle: 'Thanh toán' }} />
    </Stack>
  )
}