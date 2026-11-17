import { z } from 'zod'
import { router } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { StatusBar } from 'expo-status-bar'
import { useTransition } from 'react'
import { TouchableOpacity } from 'react-native'
import Toast from 'react-native-toast-message'

import axiosClient from '@/lib/axiosClient'
import { TokenResponse } from '@/types/token'
import { UserResponse } from '@/types/user'
import { useUserStore } from '@/stores/user'
import { CustomIcon, IconType } from '@/components/common/CustomIcon'
import { Button, ButtonText } from '@/components/ui/button'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { setAccessToken } from '@/lib/async-storage'
import FormInput from '@/components/common/FormInput'
import KeyboardProvider from '@/components/common/KeyboardProvider'

const LoginSchema = z.object({
  username: z.string().min(1, {
    message: 'Username is required',
  }),
  password: z.string().min(1, {
    message: 'Password is required',
  }),
})

type LoginSchemaType = {
  username: string
  password: string
}

const SignInScreen = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: 'admin',
      password: 'admin123',
    },
  })
  const [isPending, startTransition] = useTransition()
  const { setUser } = useUserStore()

  const onSubmit = async (data: LoginSchemaType) => {
    startTransition(() => {
      (async () => {
        try {
          const tokenResponse = await axiosClient.post<TokenResponse>('/auth/login', data)
          await setAccessToken(tokenResponse.data.data.token)
          const userResponse = await axiosClient.get<UserResponse>('/users/me')
          if (userResponse.data) setUser(userResponse.data.data)
          router.replace('/(tabs)/books')
        } catch (error) {
          Toast.show({
            type: 'error',
            text1: 'Login failed',
            text2: (error as Error).message,
          })
        }
      })()
    })
  }

  return (
    <Box className="bg-white px-4 flex-1 pt-10">
      <KeyboardProvider iosHeight={-150}>
        <Box className="w-full min-h-[85vh]">
          <Box className="mt-10">
            <Text className="font-extrabold text-3xl text-primary-500">Hey,</Text>
            <Text className="font-extrabold text-3xl text-primary-500">
              Welcome back
            </Text>
          </Box>

          <Box className="mt-8">
            <Text className="text-xl text-neutral-700 font-semibold mb-4">
              Login to your account
            </Text>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  title="Username"
                  placeholder="Enter your username"
                  value={value}
                  onBlur={onBlur}
                  handleChangeText={onChange}
                  options={{
                    autoCapitalize: 'none',
                    disableFullscreenUI: isPending,
                  }}
                  icon={
                    <CustomIcon
                      icon={{ name: 'user', type: IconType.AntDesign }}
                      size={20}
                      color="#6b7280"
                      className="mr-2"
                    />
                  }
                  formStyle="mt-4"
                />
              )}
            />
            {errors.username && <Text className="text-red-500">{errors.username.message}</Text>}

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  title="Password"
                  placeholder="Enter your password"
                  value={value}
                  onBlur={onBlur}
                  handleChangeText={onChange}
                  options={{
                    disableFullscreenUI: isPending,
                  }}
                  icon={
                    <CustomIcon
                      icon={{ name: 'lock', type: IconType.AntDesign }}
                      size={20}
                      color="#6b7280"
                      className="mr-2"
                    />
                  }
                  type="password"
                  formStyle="mt-4"
                />
              )}
            />
            {errors.password && <Text className="text-red-500">{errors.password.message}</Text>}

            <Text className="mt-4 text-right text-sm text-gray-500 font-medium">
              Forgot password?
            </Text>

            <Button size="xl" disabled={isPending} className="mt-16 shadow-sm" onPress={handleSubmit(onSubmit)}>
              <ButtonText>Log in</ButtonText>
            </Button>

            <Box className="flex-row gap-1.5 mt-6 justify-center">
              <Text className="text-neutral-700 text-lg">
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push('/sign-up')}>
                <Text className="text-primary-500 text-lg font-semibold">
                  Sign up
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>
        </Box>
      </KeyboardProvider>
      <StatusBar style="auto" />
    </Box>
  )
}

export default SignInScreen
