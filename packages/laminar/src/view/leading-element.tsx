import React, { type ReactNode } from "react";
import Animated, {
  type EntryExitAnimationFunction,
} from "react-native-reanimated";

type LeadingElementProps = {
  readonly leading?: ReactNode;
  readonly leadingKey?: string | number;
  readonly leadingGap: number;
  readonly enterTransition?: EntryExitAnimationFunction;
  readonly elementEnterTransition?: EntryExitAnimationFunction;
  readonly exitTransition?: EntryExitAnimationFunction;
  readonly elementExitTransition?: EntryExitAnimationFunction;
};

// render an inline element independently so it can enter, exit, and swap beside any run
export const LeadingElement = React.memo(function LeadingElement({
  leading,
  leadingKey,
  leadingGap,
  enterTransition,
  elementEnterTransition,
  exitTransition,
  elementExitTransition,
}: LeadingElementProps) {
  if (!leading) {
    return null;
  }

  return (
    <Animated.View
      key={`leading:${String(leadingKey ?? "default")}`}
      entering={elementEnterTransition ?? enterTransition}
      exiting={elementExitTransition ?? exitTransition}
      style={[
        { alignItems: "center", justifyContent: "center" },
        leadingGap > 0 ? { marginRight: leadingGap } : undefined,
      ]}
    >
      {leading}
    </Animated.View>
  );
});

LeadingElement.displayName = "LeadingElement";
