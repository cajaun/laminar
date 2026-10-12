import React, { useEffect, useRef, useState } from "react";
import { Text } from "react-native";
import type { TextStyle } from "react-native";
import type { AnimatedTextProps } from "@/components/flux-chart/core/types";

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
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const startValue = previousValue.current;
    previousValue.current = value;

    if (startValue === value) {
      setDisplayValue(value);
      return;
    }

    const startedAt = Date.now();
    const duration = 250;
    let frame = 0;

    const tick = () => {
      const progress = Math.min(1, (Date.now() - startedAt) / duration);
      const eased = 1 - (1 - progress) ** 3;
      const nextValue = startValue + (value - startValue) * eased;
      setDisplayValue(fractionDigits === 0 ? Math.round(nextValue) : nextValue);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [fractionDigits, value]);

  const textStyle: TextStyle = {
    fontSize,
    fontWeight,
    fontFamily: fontWeight === "normal" ? "Sf-regular" : "Sf-bold",
  };

  return (
    <Text
      className={`text-[#111318] tracking-[-1.5px] leading-[62px] ${className ?? ""}`}
      style={[textStyle, style]}
    >
      {prefix}
      {displayValue.toLocaleString("en-US", {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      })}
      {suffix}
    </Text>
  );
}
