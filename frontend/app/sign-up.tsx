import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useTransition } from 'react'
import { TouchableOpacity } from 'react-native'
import Toast from 'react-native-toast-message'

import axiosClient from '@/lib/axiosClient'
import KeyboardProvider from '@/components/common/KeyboardProvider'
import FormInput from '@/components/common/FormInput'
import { CustomIcon, IconType } from '@/components/common/CustomIcon'
import { Box } from '@/components/ui/box'
import { Button, ButtonText } from '@/components/ui/button'
import { Text } from '@/components/ui/text'

const SignUpSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required',
  }),
  username: z.string().min(1, {
    message: 'Username is required',
  }),
  email: z.string().email({
    message: 'Email is invalid',
  }),
  password: z.string().min(1, {
    message: 'Password is required',
  }),
})

type SignUpSchemaType = {
  name: string
  username: string
  email: string
  password: string
}

const SignUpScreen = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      username: '',
      password: '',
      email: '',
      name: '',
    },
  })
  const [isPending, startTransition] = useTransition()

  const onSubmit = async (data: SignUpSchemaType) => {
    startTransition(() => {
      (async () => {
        try {
          await axiosClient.post('/users/add', data)
          router.push('/sign-in')
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
            <Text className="font-extrabold text-3xl text-primary-500">Let's</Text>
            <Text className="font-extrabold text-3xl text-primary-500">
              Get started
            </Text>
          </Box>

          <Box className="mt-8">
            <Text className="text-xl text-neutral-700 font-semibold mb-4">
              Create an account
            </Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  title="Name"
                  placeholder="Enter your name"
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
            {errors.name && <Text className="text-red-500">{errors.name.message}</Text>}
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
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  title="Email"
                  placeholder="Enter your email"
                  value={value}
                  onBlur={onBlur}
                  handleChangeText={onChange}
                  options={{
                    autoCapitalize: 'none',
                    disableFullscreenUI: isPending,
                  }}
                  icon={
                    <CustomIcon
                      icon={{ name: 'mail', type: IconType.AntDesign }}
                      size={20}
                      color="#6b7280"
                      className="mr-2"
                    />
                  }
                  formStyle="mt-4"
                />
              )}
            />
            {errors.email && <Text className="text-red-500">{errors.email.message}</Text>}
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
              <ButtonText>Sign up</ButtonText>
            </Button>

            <Box className="flex-row gap-1.5 mt-6 justify-center">
              <Text className="text-neutral-700 text-lg">
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push('/sign-in')} disabled={isPending}>
                <Text className="text-primary-500 text-lg font-semibold">
                  Log in
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

export default SignUpScreen
