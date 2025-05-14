import React from "react";
import { Svg, Path, Polygon, Line } from "react-native-svg";

interface Props {
  width?: string | number;
  height?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const Share = ({ color = "currentColor", strokeWidth = 2, ...props }: Props) => {
  return (
    <Svg
      aria-label="Share"
      fill="currentColor"
      width="1em"
      height="1em"
      {...props}
      viewBox="0 0 24 24"
    >
     <Line
  fill="none"
  stroke={color}
  strokeLinejoin="round"
  strokeWidth={strokeWidth}
  x1="22"
  x2="9.218"
  y1="3"
  y2="10.083"
/>
<Polygon
  fill="none"
  points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
  stroke={color}
  strokeLinejoin="round"
  strokeWidth={strokeWidth}
/>

    </Svg>
  );
};
