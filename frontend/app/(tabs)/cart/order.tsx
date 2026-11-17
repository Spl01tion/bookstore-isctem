import { z } from 'zod'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { useOrderStore } from '@/stores/orderStore'
import { Image } from '@/components/ui/image'
import { formatVND } from '@/utils/format'
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { ScrollView } from 'react-native'
import { useUserStore } from '@/stores/user'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { useTransition } from 'react'
import { OrderResponse } from '@/types/order'
import axiosClient from '@/lib/axiosClient'
import { useCartStore } from '@/stores/cart'
import Toast from 'react-native-toast-message'

const formSchema = z.object({
  userId: z.string(),
  receiverName: z.string().min(1, {
    message: 'Tên người nhận không được để trống',
  }),
  receiverPhone: z.string().min(10, {
    message: 'Số điện thoại không hợp lệ',
  }),
  address: z.string().min(1, {
    message: 'Địa chỉ không được để trống',
  }),
  paymentMethod: z.string().min(1, {
    message: 'Phương thức thanh toán không được để trống',
  }),
  orderStatus: z.string(),
  total: z.number().min(1, {
    message: 'Tổng số tiền không hợp lệ',
  }),
  orderDetails: z.array(z.object({
    bookId: z.string(),
    quantity: z.number(),
    price: z.number(),
  })).min(1, {
    message: 'Đơn hàng phải có ít nhất một sản phẩm',
  }),
})

type FormValues = {
  userId: string
  receiverName: string
  receiverPhone: string
  address: string
  paymentMethod: string
  orderStatus: string
  total: number
  orderDetails: {
    bookId: string
    quantity: number
    price: number
  }[]
}

export default function Order() {
  const { orderDetails, setOrderDetails } = useOrderStore()
  const { user } = useUserStore()
  const { removeCart } = useCartStore()
  const [isPending, startTransition] = useTransition()
  if (!user) return <LoadingSpinner />

  const address = user?.addresses[0]

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: user.id,
      receiverName: address?.receiverName || '',
      receiverPhone: address?.receiverPhone || '',
      address: address?.address || '',
      paymentMethod: 'COD',
      orderStatus: 'PENDING',
      total: orderDetails.reduce((acc, item) => acc + item.price * item.quantity, 0),
      orderDetails: orderDetails.map(item => ({
        bookId: item.book.id,
        quantity: item.quantity,
        price: item.price,
      })),
    },
  })

  function onSubmit(values: FormValues) {
    console.log(values)
    startTransition(() => {
      axiosClient.post<OrderResponse>('/orders', values)
        .then(() => {
          // Remove selected items from the cart
          values.orderDetails.forEach((item) => {
            removeCart(item.bookId)
          })
          Toast.show({
            type: 'success',
            text1: 'Đặt hàng thành công',
          })
          router.push('/(tabs)/user')
        })
        .catch((error: Error) => {
        })
    })
  }

  return (
    <ScrollView>
      <Box className="bg-white w-full p-4 rounded-lg">
        <Text size="xl" className="font-semibold mb-4">Chi tiết đơn hàng</Text>
        {orderDetails.map((item) => (
          <Box key={item.book.id} className="flex-1 flex-row">
            <Image
              source={{ uri: item.book.bookImages[0].url }}
              alt={item.book.title}
              resizeMode="contain"
              size="xl"
            />
            <Box className="flex-1">
              <Text className="font-semibold mb-2 text-typography-700 truncate">
                {item.book.title}
              </Text>
              <Box className="mt-auto mb-2">
                <Text className="text-xl font-bold text-primary-500">
                  {formatVND(item.book.discountPrice)}
                </Text>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
      <Box className="bg-white w-full p-4 rounded-lg mt-4">
        <Text size="xl" className="font-semibold mb-4">Địa chỉ giao hàng</Text>

        <Box className="flex-row gap-4 items-center">
          <Box className="flex-1">
            <Text className="font-semibold text-typography-700">{address?.receiverName}</Text>
            <Text>{address?.receiverPhone}</Text>
            <Text>{address?.address}</Text>
          </Box>
        </Box>
      </Box>

      <Box className="flex-row p-4 rounded-lg w-full bg-white mt-auto">
        <Box className="flex-1">
          <Text className="font-semibold text-typography-700 truncate">
            Tổng cộng
          </Text>
          <Text className="text-xl font-bold text-primary-500">
            {formatVND(watch('total'))}
          </Text>
        </Box>
        <Button size="lg" isDisabled={isPending} onPress={handleSubmit(onSubmit)}>
          <ButtonText>Thanh toán</ButtonText>
        </Button>
      </Box>
    </ScrollView>
  )
}