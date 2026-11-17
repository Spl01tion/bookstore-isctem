import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
  KeyboardTypeOptions,
} from 'react-native'
import { CustomIcon, IconType } from './CustomIcon'

type FormInputProps = {
  title?: string
  value: string
  type?: string
  placeholder?: string
  onBlur?: () => void
  handleChangeText: (e: string) => void
  formStyle?: string
  keyBoardType?: KeyboardTypeOptions
  options?: TextInputProps
  icon?: any
}

const FormInput = ({
  title,
  value,
  type,
  placeholder,
  formStyle,
  keyBoardType,
  options,
  icon,
  onBlur,
  handleChangeText,
}: FormInputProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [inputValue, setInputValue] = useState(value);

  const handleClear = () => {
    setInputValue('');
    handleChangeText('');
  };

  return (
    <View className={`gap-2 ${formStyle}`}>
      <Text className='text-base text-neutral-600 font-medium'>{title}</Text>
      <View
        className='w-full py-3 px-2.5 bg-neutral-100 border-2 border-gray-200 rounded-lg
        focus:border-gray-600 items-center flex-row'
      >
        {icon && icon}

        <TextInput
          value={inputValue}
          onChangeText={(text) => {
            setInputValue(text);
            handleChangeText(text);
          }}
          onBlur={onBlur}
          className='flex-1 font-semibold text-base'
          placeholder={placeholder}
          placeholderTextColor='#bebbbe'
          secureTextEntry={type === 'password' && !showPassword}
          keyboardType={keyBoardType}
          {...options}
        />

        {value && (
          <TouchableOpacity onPress={handleClear}>
            <CustomIcon
              icon={{ name: 'closecircle', type: IconType.AntDesign }}
              size={16}
              color='#d1d5db'
            />
          </TouchableOpacity>
        )}

        {type === 'password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {!showPassword ? (
              <CustomIcon
                icon={{ name: 'eye-outline', type: IconType.Ionicons }}
                size={20}
                color='#bebbbe'
                className='ml-2'
              />
            ) : (
              <CustomIcon
                icon={{ name: 'eye-off-outline', type: IconType.Ionicons }}
                size={20}
                color='#bebbbe'
                className='ml-2'
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default FormInput
