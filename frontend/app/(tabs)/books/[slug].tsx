import { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'

import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { Image } from '@/components/ui/image'
import { formatVND } from '@/utils/format'
import { CustomIcon, IconType } from '@/components/common/CustomIcon'
import { Divider } from '@/components/ui/divider'
import { ScrollView } from 'react-native'
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { AddIcon, RemoveIcon } from '@/components/ui/icon'
import { useCartStore } from '@/stores/cart'
import axiosClient from '@/lib/axiosClient'
import { Book, BookResponse } from '@/types/book'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function BookDetail() {
  const { slug } = useLocalSearchParams()
  const { addCart, carts, increaseQuantity } = useCartStore()
  const [quantity, setQuantity] = useState(1)
  const [book, setBook] = useState<Book>()

  useEffect(() => {
    const fetchBook = async () => {
      const { data } = await axiosClient.get<BookResponse>(`/books/slug/${slug}`)
      setBook(data.data)
    }
    fetchBook()
  }, [slug])

  if (!book) return <LoadingSpinner />

  const handleIncrease = () => setQuantity(prevQuantity => prevQuantity + 1)
  const handleDecrease = () => setQuantity(prevQuantity => Math.max(1, prevQuantity - 1))

  const handleAddToCart = () => {
    addCart({ book, quantity })
    router.push('/cart')
  }

  return (
    <>
      <ScrollView className="scroll-pb-10">
        <Box className="min-h-[100vh] gap-4">
          <Box className="p-4 pt-10 rounded-lg w-full bg-white">
            <Image
              source={{ uri: book.bookImages[0].url }}
              alt={book.title}
              resizeMode="contain"
              className="mb-6 h-[200px] w-full rounded-md"
            />
            <Box className="flex-row gap-3 items-start">
              <Text className="mb-4 text-3xl font-bold text-primary-500">
                {formatVND(book.discountPrice)}
              </Text>
              <Text strikeThrough className="mb-4 text-lg text-typography-500">
                {formatVND(book.discount && book.price)}
              </Text>
              <Box className="px-2 py-1 bg-primary-50 rounded-md">
                <Text className="text-sm text-primary-500">-{book.discount && book.discount.percent}%</Text>
              </Box>
            </Box>
            <Text size="xl" className="font-semibold text-typography-700 truncate">
              {book.title}
            </Text>
            <Box className="flex-row gap-1 items-center justify-between mt-2">
              <Box className="flex-row items-center gap-1">
                <CustomIcon icon={{ name: 'star', type: IconType.AntDesign }} size={14} color="#fbbf24" />
                <Text className="text-sm font-bold">
                  5
                </Text>
                <Text className="text-sm text-typography-500 ml-2">
                  Đã bán <Text className="text-sm font-medium text-typography-700">{book.sold}</Text>
                </Text>
              </Box>
              <Text className="text-sm text-typography-500">
                Kho <Text className="text-sm font-medium text-typography-700">{book.stock}</Text>
              </Text>
            </Box>
          </Box>

          <Box className="p-4 rounded-lg w-full bg-white">
            <Text size="xl" bold className="mb-4">Thông tin chi tiết</Text>
            <Box className="flex-row gap-4 py-1.5">
              <Text size="md" className="w-[120px] text-typography-500">Danh mục</Text>
              <Text size="md" className="font-medium">{book.category.name}</Text>
            </Box>
            <Divider className="my-0.5 bg-gray-300" />
            <Box className="flex-row gap-4 py-1.5">
              <Text size="md" className="w-[120px] text-typography-500">Nhà xuất bản</Text>
              <Text size="md" className="font-medium">{book.publisher.name}</Text>
            </Box>
            <Divider className="my-0.5 bg-gray-300" />
            <Box className="flex-row gap-4 py-1.5">
              <Text size="md" className="w-[120px] text-typography-500">Năm xuất bản</Text>
              <Text size="md" className="font-medium">{book.publishYear}</Text>
            </Box>
            <Divider className="my-0.5 bg-gray-300" />
            <Box className="flex-row gap-4 py-1.5">
              <Text size="md" className="w-[120px] text-typography-500">Tác giả</Text>
              <Text size="md" className="font-medium">{book.author}</Text>
            </Box>
            <Divider className="my-0.5 bg-gray-300" />
            <Box className="flex-row gap-4 py-1.5">
              <Text size="md" className="w-[120px] text-typography-500">Kích thước</Text>
              <Text size="md" className="font-medium">{book.size}</Text>
            </Box>
            <Divider className="my-0.5 bg-gray-300" />
            <Box className="flex-row gap-4 py-1.5">
              <Text size="md" className="w-[120px] text-typography-500">Trọng lượng (gr)</Text>
              <Text size="md" className="font-medium">{book.weight}</Text>
            </Box>
            <Divider className="my-0.5 bg-gray-300" />
            <Box className="flex-row gap-4 py-1.5">
              <Text size="md" className="w-[120px] text-typography-500">Số trang</Text>
              <Text size="md" className="font-medium">{book.pages}</Text>
            </Box>

            <Text size="lg" bold className="mt-4">Mô tả</Text>
            <Text size="md" className="text-typography-500">
              {book.description}
            </Text>
          </Box>
        </Box>
      </ScrollView>

      <Box className="bg-white h-16 w-full flex-row gap-1 shadow-md">
        <Box className="flex-1 justify-center items-center flex-row gap-2">
          <Button size="xs" action="secondary" variant="outline" onPress={handleDecrease}>
            <ButtonIcon as={RemoveIcon} />
          </Button>
          <Text className="text-lg font-bold">{quantity}</Text>
          <Button size="xs" action="secondary" variant="outline" onPress={handleIncrease}>
            <ButtonIcon as={AddIcon} />
          </Button>
        </Box>
        <Box className="flex-1 py-1">
          <Button variant="outline" className="h-full justify-center" onPress={handleAddToCart}>
            <ButtonText>Thêm vào giỏ hàng</ButtonText>
          </Button>
        </Box>
        <Box className="flex-1 py-1">
          <Button className="h-full">
            <ButtonText>Mua ngay</ButtonText>
          </Button>
        </Box>
      </Box>
    </>
  )
}