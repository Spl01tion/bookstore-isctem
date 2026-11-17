import { useEffect, useState } from 'react'
import { FlatList, TouchableOpacity } from 'react-native'

import axiosClient from '@/lib/axiosClient'
import { CategoriesResponse } from '@/types/category'
import { useListBooksStore } from '@/stores/listBooksStore'
import { Text } from '@/components/ui/text'

export function ListBooksCategory() {
  const { clear, setCategorySlug, categorySlug } = useListBooksStore()
  const [categories, setCategories] = useState<CategoriesResponse>()

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await axiosClient.get<CategoriesResponse>('/categories')
      setCategories(data)
    }
    fetchCategories()
  }, [])

  if (!categories) return null

  return (
    <FlatList
      horizontal
      data={[{ id: 'all', name: 'All', slug: '' }, ...categories.data]}
      keyExtractor={item => item.id}
      contentContainerClassName="bg-white p-4"
      renderItem={({ item }) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => setCategorySlug(item.slug)}
          className={`px-4 py-2 mr-2 rounded-full bg-primary-50 ${categorySlug === item.slug ? 'bg-primary-500' : ''}`}
        >
          <Text className={`text-sm ${categorySlug === item.slug ? 'text-white' : 'text-primary-500'}`}>
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
    />
  )
}