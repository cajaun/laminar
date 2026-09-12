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
export const numericValues = ["$1,234", "$12,345", "$1,089", "$980"] as const;
// Distinct black-price snapshots from number-ticker.mov, in source order.
export const numberFlowValues = [
  "$2,462.78",
  "$2,465.45",
  "$2,468.65",
  "$2,465.06",
  "$2,460.38",
  "$2,462.03",
  "$2,461.38",
  "$2,465.09",
  "$2,467.23",
  "$2,466.99",
  "$2,465.37",
  "$2,465.73",
  "$2,464.00",
  "$2,463.44",
  "$2,464.08",
  "$2,462.15",
  "$2,462.27",
  "$2,461.34",
  "$2,460.54",
  "$2,461.66",
  "$2,459.87",
  "$2,459.28",
  "$2,460.50",
  "$2,460.74",
  "$2,460.04",
  "$2,458.63",
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
  { id: "numbers", label: "Numbers" },
  { id: "numberFlow", label: "Number Flow" },
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
