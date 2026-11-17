import AsyncStorage from '@react-native-async-storage/async-storage'

export const setAccessToken = async (value: string) => {
  try {
    await AsyncStorage.setItem('accessToken', value)
  } catch (e) {
    console.error(e)
  }
}

export const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem('accessToken')
  } catch (e) {
    console.error(e)
  }
}

export const removeAccessToken = async () => {
  try {
    await AsyncStorage.removeItem('accessToken')
  } catch (e) {
    console.error(e)
  }
}