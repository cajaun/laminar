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
// numeric renderers share the laminar shell and choose their own value motion
export type MorphNumberMode = "morph" | "ticker" | "slots";
export type SlotMode = "standard" | "reelStep" | "input";
export type LaminarAlign = "left" | "center" | "right";

// text keys keep leading content paired with the displayed value
export type LaminarLeadingMap = Readonly<Record<string, ReactNode>>;

export type LaminarShadowOptions = {
  // provide the surface color when a platform needs an alpha mask
  readonly color?: string;
  // set the fade depth in pixels with a default near one third of the viewport
  readonly size?: number;
};

export type LaminarShadow = boolean | LaminarShadowOptions;

// send preformatted values to the ui thread without formatting on each sample
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
  // keep timing and layout options consistent across variants
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
  // scale growing formatted values within the available slot viewport
  readonly slotMode?: SlotMode;
  // select the numeric renderer
  readonly numberMode?: MorphNumberMode;
  // scale the decimal separator and fraction glyphs in ticker mode
  readonly fractionScale?: number;
  // classify numeric input separators with the supplied locale
  readonly locale?: string;
  // provide the caret offset in utf16 code units of the rendered text
  readonly caretIndex?: number;
  readonly animatedText?: LaminarAnimatedText;
  // start slot handoffs from the last value shown by the numeric renderer
  readonly fromValue?: string;
  // keep the slot renderer mounted while ticker mode is active
  readonly preloadValue?: string;
  readonly fontSize?: number;
  readonly color?: string;
  readonly align?: LaminarAlign;
  readonly className?: string;
  // render leading content before the value
  readonly leading?: ReactNode | LaminarLeadingMap;
  // use the leading key to identify replacement content
  readonly leadingKey?: string | number;
  // set the gap between leading content and the value
  readonly leadingGap?: number;
  // fade slot reels at the edges with a shadow
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
