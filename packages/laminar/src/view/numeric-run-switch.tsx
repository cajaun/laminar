import React from "react";
import type {
  LaminarAlign,
  LaminarAnimatedText,
  LaminarShadow,
  MotionRecipe,
} from "../types";
import { SlotsRun } from "./slots-run";
import { TickerRun } from "./ticker-run";

type NumericRunMode = "slots" | "ticker";

type NumericRunSwitchProps = {
  readonly mode: NumericRunMode;
  readonly value: string;
  readonly animatedText?: LaminarAnimatedText;
  readonly slotsMotionRecipe: MotionRecipe;
  readonly tickerMotionRecipe: MotionRecipe;
  readonly align: LaminarAlign;
  readonly fontSize?: number;
  readonly textStyle?: React.ComponentProps<typeof SlotsRun>["textStyle"];
  readonly className?: string;
  readonly leading?: React.ReactNode;
  readonly leadingKey?: string | number;
  readonly leadingGap?: number;
  readonly ready?: boolean;
  readonly shadow?: LaminarShadow;
};

// select one numeric renderer so inactive layout cannot affect the handoff
export const NumericRunSwitch = React.memo(function NumericRunSwitch({
  mode,
  value,
  animatedText,
  slotsMotionRecipe,
  tickerMotionRecipe,
  align,
  fontSize,
  textStyle,
  className,
  leading,
  leadingKey,
  leadingGap = 0,
  ready = true,
  shadow = false,
}: Readonly<NumericRunSwitchProps>) {
  if (mode === "slots") {
    return (
      <SlotsRun
        value={value}
        motionRecipe={slotsMotionRecipe}
        align={align}
        fontSize={fontSize}
        textStyle={textStyle}
        className={className}
        leading={leading}
        leadingKey={leadingKey}
        leadingGap={leadingGap}
        ready={ready}
        shadow={shadow}
      />
    );
  }

  return (
    <TickerRun
      value={value}
      animatedText={animatedText}
      motionRecipe={tickerMotionRecipe}
      align={align}
      fontSize={fontSize}
      textStyle={textStyle}
      className={className}
      leading={leading}
      leadingKey={leadingKey}
      leadingGap={leadingGap}
      ready={ready}
      shadow={shadow}
    />
  );
});

NumericRunSwitch.displayName = "NumericRunSwitch";
