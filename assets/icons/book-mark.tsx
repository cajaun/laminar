import React from "react";
import { Svg, Path, Polygon, Line } from "react-native-svg";

interface Props {
  width?: string | number;
  height?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const Bookmark = ({ color = "currentColor",strokeWidth = 2, ...props }: Props) => {
  return (
    <Svg
      aria-label="Save"
      fill={color}
      width="1em"
      height="1em"
      {...props}
      viewBox="0 0 24 24"
    >
      <Polygon
        fill="none"
        points="20 21 12 13.44 4 21 4 3 20 3 20 21"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      ></Polygon>
    </Svg>
  );
};
