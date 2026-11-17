import { Tabs } from 'expo-router'
import { CustomIcon, IconType } from '@/components/common/CustomIcon'
import { useCartStore } from '@/stores/cart'

export default function TabLayout() {
  const { carts } = useCartStore()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#f43f5e',
        headerStyle: { backgroundColor: '#f43f5e' },
        headerTitleStyle: { color: '#fff' },
        headerTitleAlign: 'left',
      }}>
      <Tabs.Screen
        name="books"
        options={{
          title: 'Trang chủ',
          headerShown: false,
          tabBarIcon: ({ color }) =>
            <CustomIcon icon={{ name: 'home', type: IconType.FontAwesomeIcon }} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          headerShown: false,
          tabBarBadge: carts.length,
          tabBarIcon: ({ color }) =>
            <CustomIcon icon={{ name: 'shopping-cart', type: IconType.FontAwesomeIcon }} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color }) =>
            <CustomIcon icon={{ name: 'user', type: IconType.FontAwesomeIcon }} size={24} color={color} />,
        }}
      />
    </Tabs>
  )
}