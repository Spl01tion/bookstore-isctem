import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Order, OrderResponse } from '@/types/order'
import axiosClient from '@/lib/axiosClient'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function OrderDetail() {
  const { orderId } = useLocalSearchParams()

  const [order, setOrder] = useState<Order>()

  useEffect(() => {
    const fetchOrder = async () => {
      const { data: orderData } = await axiosClient.get<OrderResponse>(`/orders/${orderId}`)
      setOrder(orderData.data)
    }
    fetchOrder()
  }, [orderId])

  if (!order) return <LoadingSpinner />

  return (
    <Box>
      <Box className="flex-row w-full px-2 py-3 bg-gray-300">
        <Text bold className="w-[30%]">Tên sách</Text>
        <Text bold className="w-[20%]">Số lượng</Text>
        <Text bold className="w-[20%]">Giá</Text>
        <Text bold className="w-[30%]">Tổng tiền</Text>
      </Box>
      {order.orderDetails.map((item, index) => (
        <Box className="flex-row w-full p-2" key={index}>
          <Text className="w-[30%]">{item.bookTitle}</Text>
          <Text className="w-[20%]">{item.quantity}</Text>
          <Text className="w-[20%]">{item.price}</Text>
          <Text className="w-[30%]">{item.price * item.quantity}</Text>
        </Box>
      ))}
    </Box>
  )
}