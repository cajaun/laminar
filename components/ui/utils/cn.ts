import { StyleProp } from "react-native";

export const cn = (className?: string): StyleProp<any> => {
  // If using NativeWind → just return className
  return className as any;
};