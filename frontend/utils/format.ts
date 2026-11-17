export function formatVND(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export function formatDateTime(value: string) {
  return new Date(value).getDate() + '/' + (new Date(value).getMonth() + 1) + '/' + new Date(value).getFullYear()
}