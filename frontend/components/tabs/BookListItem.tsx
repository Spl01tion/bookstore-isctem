import { Link } from 'expo-router'

import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { Image } from '@/components/ui/image'
import { formatVND } from '@/utils/format'
import { CustomIcon, IconType } from '@/components/common/CustomIcon'
import { Book } from '@/types/book'

type BookListItemProps = {
  book: Book
}

export default function BookListItem({ book }: BookListItemProps) {
  return <>
    <Box className="p-4 rounded-lg max-w-[360px] bg-white flex-1 m-1">
      <Link href={`/books/${book.slug}`}>
        <Box className="flex-1 w-full">
          <Image
            source={{ uri: book.bookImages[0].url }}
            alt={book.title}
            resizeMode="contain"
            className="mb-6 h-[200px] w-full rounded-md"
          />
          <Text className="font-semibold mb-2 text-typography-700 truncate">
            {book.title}
          </Text>
        </Box>
      </Link>
      <Box className="flex-row gap-1 items-center mt-auto">
        <Text className="text-xl font-bold text-primary-500">
          {formatVND(book.discountPrice)}
        </Text>
        <Text strikeThrough className="text-sm text-typography-500">
          {formatVND(book.discount && book.price)}
        </Text>
      </Box>
      <Box className="flex-row gap-1 items-center justify-between mt-2">
        <Box className="flex-row items-center gap-1">
          <CustomIcon icon={{ name: 'star', type: IconType.AntDesign }} size={14} color="#fbbf24" />
          <Text className="text-sm font-bold">
            5
          </Text>
        </Box>
        <Text className="text-sm text-typography-500">
          Đã bán <Text className="text-sm font-medium text-typography-700">{book.sold}</Text>
        </Text>
      </Box>
    </Box>
  </>
}