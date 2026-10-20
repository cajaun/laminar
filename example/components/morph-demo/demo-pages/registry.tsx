import type { ComponentType } from "react";
import type { ExamplePageId } from "../demo-data";
import type { DemoPageProps } from "./types";
import {
  AnimationLayerDemoPage,
  AutoSizeDemoPage,
  MultiIconDemoPage,
  SingleIconDemoPage,
  SlotsDemoPage,
  TextIdentityDemoPage,
} from "./how-it-works";
import {
  ButtonDemoPage,
  ConfirmationDemoPage,
  EditorDemoPage,
  ReelStepDemoPage,
  NumberTickerDemoPage,
  NumbersDemoPage,
  SlotsExampleDemoPage,
  TransactionDemoPage,
  WordsDemoPage,
} from "./examples";
import { NumberTickerSliderDemoPage } from "@/components/number-ticker-slider";

export const demoPageComponents: Record<
  ExamplePageId,
  ComponentType<DemoPageProps>
> = {
  textIdentity: TextIdentityDemoPage,
  animationLayer: AnimationLayerDemoPage,
  autoSize: AutoSizeDemoPage,
  slotsMechanism: SlotsDemoPage,
  singleIcon: SingleIconDemoPage,
  multiIcon: MultiIconDemoPage,
  editor: EditorDemoPage,
  words: WordsDemoPage,
  button: ButtonDemoPage,
  transaction: TransactionDemoPage,
  confirmation: ConfirmationDemoPage,
  numbers: NumbersDemoPage,
  slots: SlotsExampleDemoPage,
  reelStep: ReelStepDemoPage,
  numberTicker: NumberTickerDemoPage,
  numberTickerSlider: NumberTickerSliderDemoPage,
};
