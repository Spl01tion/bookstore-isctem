import { cn } from '@/lib/utils'
import { Text, View } from 'react-native'

export interface ISVGProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  className?: string
}

export const LoadingSpinner = ({
                                 size = 24,
                                 className,
                                 ...props
                               }: ISVGProps) => {
  return (
    <View className="min-h-[50vh] flex items-center justify-center bg-background rounded-lg">
      <Text>Loading...</Text>
    </View>
  )
}
