import { Text } from "react-native";
import type { TextStyle } from "react-native";
import type { AnimatedTextProps } from "@/components/morphing-chart/core/types";

// Kept as a compatibility primitive, but deliberately renders a semantic
// value. Animation must be owned by a native/UI-thread renderer, never by a
// JavaScript frame loop that updates React state per frame.
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
      className={`text-[#111318] tracking-[-1.5px] leading-[62px] ${className ?? ""}`}
      style={[textStyle, style]}
    >
      {displayText}
    </Text>
  );
}
