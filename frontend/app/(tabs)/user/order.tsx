import { Box } from '@/components/ui/box'
import { ListOrdersResponse } from '@/types/order'
import { useEffect, useState } from 'react'
import axiosClient from '@/lib/axiosClient'
import { useUserStore } from '@/stores/user'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { FlatList, TouchableOpacity } from 'react-native'
import { Text } from '@/components/ui/text'
import { formatDateTime } from '@/utils/format'
import { router } from 'expo-router'

export default function UserOrder() {
  const [orders, setOrders] = useState<ListOrdersResponse>()
  const { user } = useUserStore()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: ordersData } = await axiosClient.get<ListOrdersResponse>(`/orders/list/user/${user?.id}`)
        setOrders(ordersData)
      } catch (error) {
        console.error('Error fetching orders:', error)
      }
    }
    fetchOrders()
  }, [])

  if (!orders) return <LoadingSpinner />

  return (
    <Box>
      <Box className="flex-row w-full px-2 py-3 bg-gray-300">
        <Text bold className="w-[30%]">Họ tên</Text>
        <Text bold className="w-[30%]">Thời gian</Text>
        <Text bold className="w-[30%]">Tổng tiền</Text>
        <Text bold className="w-[10%]">Xem</Text>
      </Box>
      <FlatList data={orders.data.items} renderItem={({ item }) => (
        <Box className="flex-row w-full p-2">
          <Text className="w-[30%]">{item.receiverName}</Text>
          <Text className="w-[30%]">{formatDateTime(item.createdAt)}</Text>
          <Text className="w-[30%] text-rose-500">{item.total}</Text>
          <TouchableOpacity className="w-[10%]" onPress={() => router.push(`/user/${item.id}`)}>
            <Text>Xem</Text>
          </TouchableOpacity>
        </Box>
      )} />
    </Box>
  )
}