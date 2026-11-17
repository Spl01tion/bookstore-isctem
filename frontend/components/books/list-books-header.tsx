import { useCallback, useState } from 'react'
import { debounce } from 'lodash'

import { useListBooksStore } from '@/stores/listBooksStore'
import { CustomIcon, IconType } from '@/components/common/CustomIcon'
import { Box } from '@/components/ui/box'
import FormInput from '@/components/common/FormInput'
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { ChevronDownIcon, MenuIcon, RepeatIcon } from '@/components/ui/icon'
import { Drawer, DrawerBackdrop, DrawerBody, DrawerContent } from '@/components/ui/drawer'
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from '@/components/ui/select'

export function ListBooksHeader() {
  const { search, setSearch, setSortBy } = useListBooksStore()
  const [showDrawer, setShowDrawer] = useState(false)

  const debounceSearch = useCallback(
    debounce((value: string) => {
      setSearch(value)
    }, 300),
    [setSearch],
  )

  return (
    <Box className="flex-row items-center gap-2 bg-primary-500 px-4 pb-2 pt-6">
      <FormInput
        formStyle="flex-1"
        value={search}
        handleChangeText={(value) => debounceSearch(value)}
        placeholder="Tìm kiếm sách"
        icon={<CustomIcon icon={{ name: 'search', type: IconType.Ionicons }} size={20} color="gray" />}
      />

      <Box className="mt-8">
        <Button onPress={() => setShowDrawer(true)}>
          <ButtonIcon as={MenuIcon} className="w-8 h-8" />
        </Button>
        <Drawer
          isOpen={showDrawer}
          onClose={() => setShowDrawer(false)}
          size="lg"
          anchor="right"
        >
          <DrawerBackdrop />
          <DrawerContent className="pt-10">
            <DrawerBody>
              <Button onPress={() => setShowDrawer(true)} variant="outline" action="secondary">
                <ButtonIcon as={RepeatIcon} className="w-5 h-5" />
                <ButtonText className="text-typography-600">Làm mới</ButtonText>
              </Button>

              <Select
                className="mt-6"
                onValueChange={(value) => setSortBy(value)}
              >
                <SelectTrigger variant="outline" size="md">
                  <SelectInput placeholder="Sắp xếp theo" />
                  <SelectIcon className="mr-3" as={ChevronDownIcon} />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    <SelectItem label="Tên a-z" value="title:asc" />
                    <SelectItem label="Tên z-a" value="title:desc" />
                    <SelectItem label="Giá thấp đến cao" value="price:asc" />
                    <SelectItem label="Giá cao đến thấp" value="price:desc" />
                  </SelectContent>
                </SelectPortal>
              </Select>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>

    </Box>
  )
}
