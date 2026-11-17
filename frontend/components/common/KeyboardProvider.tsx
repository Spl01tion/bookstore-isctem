import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native'

type KeyboardProviderProps = {
  children: React.ReactNode
  iosHeight?: number
  androidHeight?: number
}

const KeyboardProvider = ({
  children,
  iosHeight,
  androidHeight
}: KeyboardProviderProps) => {
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'position' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? iosHeight : androidHeight}
      className='flex-1'
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        {children}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

export default KeyboardProvider
