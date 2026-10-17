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
  NumberFlowDemoPage,
  NumbersDemoPage,
  SlotsExampleDemoPage,
  TransactionDemoPage,
  WordsDemoPage,
} from "./examples";

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
  numberFlow: NumberFlowDemoPage,
};
