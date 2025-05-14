import React from "react";
import { Svg, Path, Polygon, Line, Circle } from "react-native-svg";

interface Props {
  width?: string | number;
  height?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const ThreeDots = ({
  color = "currentColor",
  strokeWidth = 2,
  ...props
}: Props) => {
  return (
    <Svg
    fill={color}
    width="1em"
    height="1em"
    {...props}
      viewBox="0 0 24 24"
    >
  
      <Circle cx="12" cy="12" r="1.5"></Circle>
      <Circle cx="6" cy="12" r="1.5"></Circle>
      <Circle cx="18" cy="12" r="1.5"></Circle>
    </Svg>
  );
};
