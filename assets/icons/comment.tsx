import React from "react";
import { Svg, Path, Polygon, Line } from "react-native-svg";

interface Props {
  width?: string | number;
  height?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const Comment = ({
  color = "currentColor",
  strokeWidth = 2,
  ...props
}: Props) => {
  return (
    <Svg
      aria-label="Comment"
      fill={color}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <Path
        d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
        fill="none"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        stroke={color}
      ></Path>
    </Svg>
  );
};
