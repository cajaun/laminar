import type { CarouselItem } from "@/components/ui/carousel";

export const fontSizes = [32, 40, 48] as const;

export const fontWeights = [
  {
    label: "Regular",
    fontFamily: "Sf-regular",
  },
  {
    label: "Semibold",
    fontFamily: "Sf-semibold",
  },
  {
    label: "Bold",
    fontFamily: "Sf-bold",
  },
] as const;

export const editorWords = ["Craft", "Creative"] as const;
export const standaloneWords = [
  "Laminar",
  "Linear",
  "Lamina",
  "Laminae",
] as const;
export const buttonWords = [
  "Run Simulation",
  "Running Simulation",
  "Simulation Done!",
] as const;
export const transactionStates = [
  "Analyzing Transaction",
  "Transaction Safe",
  "Transaction Warning",
] as const;
export const confirmContinueWords = ["Continue", "Confirm"] as const;
// export const buttonWords = ["Let's go", "Try Varse", "Continue"] as const;
export const numericValues = ["$1,234", "$12,345", "$1,089", "$980"] as const;
export const slotValues = [
  "$0.08",
  "$147.29",
  "$2,943.61",
  "$12,884.90",
] as const;
export const textIdentityWords = ["Laminar", "Linear", "Lamina"] as const;
export const numberLaneValues = [
  "$1,234",
  "$12,345",
  "$1,089",
  "$980",
] as const;
export const animationLayerValues = ["4", "9", "2", "7"] as const;
export const autoSizeValues = [
  "Send Request",
  "Sending Request",
  "Request Sent!",
] as const;

export const examplePages = [
  { id: "textIdentity", label: "Text Identity" },
  { id: "numberIdentity", label: "Number Identity" },
  { id: "animationLayer", label: "Animation Layer" },
  { id: "autoSize", label: "Auto Size" },
  { id: "slots", label: "Slots" },
  { id: "editor", label: "Editor" },
  { id: "words", label: "Words" },
  { id: "button", label: "Button" },
  { id: "transaction", label: "Transaction" },
  { id: "confirmation", label: "Confirmation" },
  { id: "pressableSplit", label: "Pressable Split" },
  { id: "numbers", label: "Numbers" },
  { id: "slotValues", label: "Slot Values" },
] as const;

export const carouselItems: CarouselItem[] = examplePages.map(
  (_, index) => index,
);

export const stepForward = (index: number, length: number) =>
  (index + 1) % length;

export const stepBackward = (index: number, length: number) =>
  (index - 1 + length) % length;

export type ExamplePage = (typeof examplePages)[number];
export type ExamplePageId = (typeof examplePages)[number]["id"];
