import type { ReactNode } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import type {
  BaseAnimationBuilder,
  EntryExitAnimationFunction,
  SharedValue,
  WithTimingConfig,
} from "react-native-reanimated";

export type MorphAnimationPresetName =
  | "default"
  | "smooth"
  | "snappy"
  | "bouncy"
  | "ticker";

export type MorphContentVariant = "text" | "number" | "slots";
// numeric renderers share the laminar shell while changing value motion
export type MorphNumberMode = "morph" | "ticker" | "slots";
export type LaminarAlign = "left" | "center" | "right";

// text keys let leading content follow the same state as the displayed value
export type LaminarLeadingMap = Readonly<Record<string, ReactNode>>;

export type LaminarShadowOptions = {
  // surface color used by the alpha mask when a platform requires it
  readonly color?: string;
  // fade depth in pixels defaults to roughly one third of the viewport
  readonly size?: number;
};

export type LaminarShadow = boolean | LaminarShadowOptions;

// provide preformatted values to the ui thread without per sample react work
export type LaminarAnimatedText = {
  readonly index: SharedValue<number>;
  readonly values: readonly string[];
};

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
  readonly kind: "text" | "element";
  readonly value?: string;
  readonly element?: ReactNode;
};

export type NumericFlowDirection = -1 | 0 | 1;

export type MotionRecipe = {
  // every variant consumes the same timing and layout contract
  readonly durationMs: number;
  readonly easing: NonNullable<WithTimingConfig["easing"]>;
  readonly layoutTransition: BaseAnimationBuilder;
  readonly enterTransition: EntryExitAnimationFunction;
  readonly exitTransition: EntryExitAnimationFunction;
  readonly driveNumber: (toValue: number) => number;
};

export type MorphingTextProps = {
  readonly text: string | number;
  readonly variant?: MorphContentVariant;
  // number mode selects the numeric renderer
  readonly numberMode?: MorphNumberMode;
  // scale the decimal separator and fractional digits in ticker mode (0.1–1; default 1)
  readonly fractionScale?: number;
  readonly animatedText?: LaminarAnimatedText;
  // start a slot handoff from the last displayed numeric value
  readonly fromValue?: string;
  // keep the inactive slot renderer warm during ticker mode
  readonly preloadValue?: string;
  readonly fontSize?: number;
  readonly color?: string;
  readonly align?: LaminarAlign;
  readonly className?: string;
  // leading content appears before the value
  readonly leading?: ReactNode | LaminarLeadingMap;
  // leading key identifies a replacement
  readonly leadingKey?: string | number;
  // leading gap separates content from the value
  readonly leadingGap?: number;
  // shadow adds fades to slot reels
  readonly shadow?: LaminarShadow;
  readonly style?: StyleProp<TextStyle>;
  readonly containerStyle?: StyleProp<ViewStyle>;
  readonly fontStyle?: StyleProp<TextStyle>;
  readonly animationDuration?: number;
  readonly animationPreset?: MorphAnimationPresetName;
  readonly autoSize?: boolean;
  readonly clipToBounds?: boolean;
};

export type LaminarProps = MorphingTextProps;
