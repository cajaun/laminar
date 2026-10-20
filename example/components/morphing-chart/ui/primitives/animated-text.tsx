import { Text } from "react-native";
import type { TextStyle } from "react-native";
import type { AnimatedTextProps } from "@/components/morphing-chart/core/types";

// keep this compatibility api while native renderers handle motion
export default function AnimatedText({
  value,
  fontSize = 52,
  fontWeight = "700",
  prefix = "$",
  suffix = "",
  fractionDigits = 0,
  className,
  style,
}: AnimatedTextProps) {
  const textStyle: TextStyle = {
    fontSize,
    fontWeight,
    fontFamily: fontWeight === "normal" ? "Sf-regular" : "Sf-bold",
  };
  const displayText = `${prefix}${value.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}${suffix}`;

  return (
    <Text
      className={`text-[#111318] tracking-[-1.5px] leading-15.5 ${className ?? ""}`}
      style={[textStyle, style]}
    >
      {displayText}
    </Text>
  );
}
