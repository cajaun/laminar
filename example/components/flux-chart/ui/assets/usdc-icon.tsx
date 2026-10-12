import React from "react";
import { Circle, Text as SvgText, Svg } from "react-native-svg";

export function UsdcIcon({ size = 46 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 46 46">
      <Circle cx={23} cy={23} r={23} fill="#2F86D8" />
      <Circle cx={23} cy={23} r={15.5} fill="none" stroke="#FFFFFF" strokeWidth={2.5} />
      <SvgText
        x={23}
        y={32}
        fill="#FFFFFF"
        fontSize={28}
        fontWeight="700"
        textAnchor="middle"
      >
        $
      </SvgText>
    </Svg>
  );
}
