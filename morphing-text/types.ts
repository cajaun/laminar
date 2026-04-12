import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import type {
  ComplexAnimationBuilder,
  EntryExitAnimationFunction,
  WithTimingConfig,
} from "react-native-reanimated";

export type MorphAnimationPresetName =
  | "default"
  | "smooth"
  | "snappy"
  | "bouncy";

export type MorphContentVariant = "text" | "number";

type CubicBezierTuple = readonly [number, number, number, number];

export type MorphAnimationPreset =
  | {
      readonly duration: number;
      readonly ease: CubicBezierTuple;
    }
  | {
      readonly type: "spring";
      readonly duration: number;
      readonly bounce: number;
    };

export type GlyphToken = {
  readonly id: string;
  readonly value: string;
};

export type NumericFlowDirection = -1 | 0 | 1;

export type MotionRecipe = {
  readonly durationMs: number;
  readonly easing: NonNullable<WithTimingConfig["easing"]>;
  readonly layoutTransition: ComplexAnimationBuilder;
  readonly enterTransition: EntryExitAnimationFunction;
  readonly exitTransition: EntryExitAnimationFunction;
  readonly driveNumber: (toValue: number, delayMs?: number) => number;
};

export type MorphingTextProps = {
  readonly text: string | number;
  readonly variant?: MorphContentVariant;
  readonly fontSize?: number;
  readonly color?: string;
  readonly className?: string;
  readonly style?: StyleProp<TextStyle>;
  readonly containerClassName?: string;
  readonly containerStyle?: StyleProp<ViewStyle>;
  readonly fontStyle?: StyleProp<TextStyle>;
  readonly animationDuration?: number;
  readonly animationPreset?: MorphAnimationPresetName;
  readonly stagger?: number;
  readonly autoSize?: boolean;
  readonly clipToBounds?: boolean;
};
