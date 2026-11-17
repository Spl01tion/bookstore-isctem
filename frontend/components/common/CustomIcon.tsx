import {
  FontAwesome,
  MaterialIcons,
  Ionicons,
  AntDesign,
  Feather
} from '@expo/vector-icons'
import { View } from 'react-native'

export enum IconType {
  MaterialIcon,
  FontAwesomeIcon,
  Ionicons,
  AntDesign,
  FeatherIcon,
}

type CustomProps = {
  icon:
    | {
        type: IconType.MaterialIcon
        name: keyof typeof MaterialIcons.glyphMap
      }
    | {
        type: IconType.FontAwesomeIcon
        name: keyof typeof FontAwesome.glyphMap
      }
    | { type: IconType.Ionicons; name: keyof typeof Ionicons.glyphMap }
    | { type: IconType.AntDesign; name: keyof typeof AntDesign.glyphMap }
    | { type: IconType.FeatherIcon; name: keyof typeof Feather.glyphMap }
  size?: number
  color?: string
  className?: string
}

export const CustomIcon = ({
  icon,
  size = 24,
  color = 'black',
  className,
}: CustomProps) => {
  return (
    <View className={className}>
      {icon.type === IconType.FontAwesomeIcon && (
        <FontAwesome name={icon.name} size={size} color={color} />
      )}
      {icon.type === IconType.MaterialIcon && (
        <MaterialIcons name={icon.name} size={size} color={color} />
      )}
      {icon.type === IconType.Ionicons && (
        <Ionicons name={icon.name} size={size} color={color} />
      )}
      {icon.type === IconType.AntDesign && (
        <AntDesign name={icon.name} size={size} color={color} />
      )}
      {icon.type === IconType.FeatherIcon && (
        <Feather name={icon.name} size={size} color={color} />
      )}
    </View>
  )
}
