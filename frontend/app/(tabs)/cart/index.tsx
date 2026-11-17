import { useEffect, useState } from 'react'
import { FlatList } from 'react-native'

import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { AddIcon, CheckIcon, RemoveIcon, TrashIcon } from '@/components/ui/icon'
import { Image } from '@/components/ui/image'
import { formatVND } from '@/utils/format'
import { Checkbox, CheckboxGroup, CheckboxIcon, CheckboxIndicator } from '@/components/ui/checkbox'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/orderStore'
import { Link, router } from 'expo-router'

export default function CartScreen() {
  const { carts, increaseQuantity, decreaseQuantity, removeCart } = useCartStore()
  const { setOrderDetails } = useOrderStore()
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const handleCheckboxChange = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  useEffect(() => {
    const orderDetails = carts
      .filter((item) => selectedItems.includes(item.book.id))
      .map((item) => ({
        book: item.book,
        quantity: item.quantity,
        price: item.book.discountPrice,
      }))
    setOrderDetails(orderDetails)
  }, [selectedItems, carts, setOrderDetails])

  const totalPrice = carts
    .filter(item => selectedItems.includes(item.book.id))
    .reduce((acc, item) => acc + item.book.discountPrice * item.quantity, 0)

  return (
    <>
      <CheckboxGroup
        value={selectedItems}
        onChange={setSelectedItems}
      >
        <FlatList
          contentContainerClassName="p-2 gap-1"
          data={carts}
          keyExtractor={item => item.book.id}
          renderItem={({ item }) => (
            <Box className="p-4 rounded-lg w-full bg-white flex-1 flex-row">
              <Checkbox
                size="md"
                isChecked={selectedItems.includes(item.book.id)}
                value={item.book.id}
                onChange={() => handleCheckboxChange(item.book.id)}
              >
                <CheckboxIndicator>
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
              </Checkbox>
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
                <Box className="flex-row justify-between">
                  <Box className="items-center flex-row gap-2">
                    <Button size="xs" action="secondary" variant="outline"
                            onPress={() => decreaseQuantity(item.book.id)}>
                      <ButtonIcon as={RemoveIcon} />
                    </Button>
                    <Text className="text-lg font-bold">{item.quantity}</Text>
                    <Button size="xs" action="secondary" variant="outline"
                            onPress={() => increaseQuantity(item.book.id)}>
                      <ButtonIcon as={AddIcon} />
                    </Button>
                  </Box>
                  <Button size="xs" action="negative" variant="outline" onPress={() => removeCart(item.book.id)}>
                    <ButtonIcon as={TrashIcon} />
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        />
      </CheckboxGroup>
      <Box className="flex-row p-4 rounded-lg w-full bg-white mt-auto">
        <Box className="flex-1">
          <Text className="font-semibold text-typography-700 truncate">
            Tổng cộng
          </Text>
          <Text className="text-xl font-bold text-primary-500">
            {formatVND(totalPrice)}
          </Text>
        </Box>
          <Button size="lg" onPress={() => router.push('/(tabs)/cart/order')}>
            <ButtonText>Thanh toán</ButtonText>
          </Button>
      </Box>
    </>
  )
}