import React from "react";
import { Circle as SvgCircle, Path, Svg } from "react-native-svg";

export function EthereumIcon({ size = 46 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 46 46">
      <SvgCircle cx={23} cy={23} r={23} fill="#1D1D1F" />
      <Path
        d="M23 7.5 11.3 24.2 23 30.3l11.7-6.1L23 7.5Z"
        fill="#FFFFFF"
      />
      <Path
        d="M23 32.9 11.3 27.2 23 40.5l11.7-13.3L23 32.9Z"
        fill="#E8EAED"
      />
    </Svg>
  );
}
