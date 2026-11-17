import { ScrollView, TouchableOpacity } from 'react-native'
import { ReactElement } from 'react'

import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { useUserStore } from '@/stores/user'
import { images } from '@/constants'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { CustomIcon, IconType } from '@/components/common/CustomIcon'
import { router } from 'expo-router'

type OrderStatusLink = {
  name: string
  icon: ReactElement
}

const ORDER_STATUS_LINK: OrderStatusLink[] = [
  {
    name: 'Chờ thanh toán',
    icon: <CustomIcon icon={{ name: 'wallet', type: IconType.AntDesign }} color="#f43f5e" />,
  },
  {
    name: 'Đang xử lý',
    icon: <CustomIcon icon={{ name: 'inbox', type: IconType.AntDesign }} color="#f43f5e" />,
  },
  {
    name: 'Đang vận chuyển',
    icon: <CustomIcon icon={{ name: 'truck', type: IconType.FeatherIcon }} color="#f43f5e" />,
  },
  {
    name: 'Đã giao',
    icon: <CustomIcon icon={{ name: 'bag-check-outline', type: IconType.Ionicons }} color="#f43f5e" />,
  },
  {
    name: 'Đổi trả',
    icon: <CustomIcon icon={{ name: 'sync', type: IconType.Ionicons }} color="#f43f5e" />,
  },
]

export default function UserScreen() {
  const { user } = useUserStore()

  return (
    <ScrollView className="">
      <Box className="gap-4">
        <Box className="p-4 rounded-lg w-full bg-white">
          <Box className="flex-row gap-4 items-center">
            <Avatar size="lg">
              <AvatarImage source={{ uri: user?.avatar || images.defaultAvatar }} />
            </Avatar>
            <Box className=" flex-1">
              <Text className=" text-lg text-typography-700 font-semibold">{user?.name}</Text>
              <Text className=" text-typography-500">@{user?.username}</Text>
            </Box>
            <CustomIcon icon={{ name: 'settings-outline', type: IconType.Ionicons }} color="#4b5563" />
          </Box>
          <Box className="flex-row gap-4 items-center mt-4">
            <Box className="flex-1 gap-1 p-4 rounded-2xl bg-warning-100">
              <Text className="text-typography-600">Điểm thưởng</Text>
              <Box className="flex-row gap-2">
                <CustomIcon icon={{ name: 'trophy', type: IconType.FontAwesomeIcon }} size={20} color="#f59e0b" />
                <Text bold className="text-warning-700">1000</Text>
              </Box>
            </Box>
            <Box className="flex-1 gap-1 p-4 rounded-2xl bg-info-50">
              <Text className="text-typography-600">Mã giảm giá</Text>
              <Box className="flex-row gap-2">
                <CustomIcon icon={{ name: 'ticket', type: IconType.FontAwesomeIcon }} size={20} color="#0369a1" />
                <Text bold className="text-info-700">20</Text>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className="p-4 rounded-lg w-full bg-white">
          <TouchableOpacity onPress={() => router.push('/(tabs)/user/order')}>
            <Box className="flex-row gap-2 justify-between items-center">
              <Text bold className="text-typography-700">Đơn hàng của tôi</Text>
              <CustomIcon icon={{ name: 'arrow-forward-ios', type: IconType.MaterialIcon }} size={16} color="#4b5563" />
            </Box>
          </TouchableOpacity>
          <Box className="flex-row gap-2 mt-4">
            {ORDER_STATUS_LINK.map((orderStatus, index) => (
              <Box key={index} className="flex-1 items-center gap-2">
                <Box className="items-center p-4 bg-primary-50 rounded-2xl">
                  {orderStatus.icon}
                </Box>
                <Text size="sm">{orderStatus.name}</Text>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </ScrollView>
  )
}