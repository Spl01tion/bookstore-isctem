import { create } from 'zustand'

type ListBooksStoreType = {
  pageNo: number
  pageSize: string
  sortBy: string
  search: string
  categorySlug: string
  setPageNo: (value: number) => void
  setPageSize: (value: string) => void
  setSortBy: (value: string) => void
  setSearch: (value: string) => void
  setCategorySlug: (value: string) => void
  clear: () => void
}

export const useListBooksStore = create<ListBooksStoreType>((set) => ({
  pageNo: 1,
  pageSize: '8',
  sortBy: '',
  search: '',
  categorySlug: '',
  setPageNo: (value: number) => set((state) => ({ ...state, pageNo: value })),
  setPageSize: (value: string) => set((state) => ({ ...state, pageSize: value })),
  setSortBy: (value: string) => set((state) => ({ ...state, sortBy: value })),
  setSearch: (value: string) => set((state) => ({ ...state, search: value })),
  setCategorySlug: (value: string) => set((state) => ({ ...state, categorySlug: value })),
  clear: () => set(() => ({
    pageNo: 1,
    pageSize: '8',
    sortBy: '',
    search: '',
    categorySlug: '',
  })),
}))

