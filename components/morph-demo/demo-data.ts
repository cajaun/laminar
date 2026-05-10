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
  "Calligraph",
  "Craft",
  "Creative",
  "Create",
] as const;
export const buttonWords = ["Back Up Now", "Backing Up", "Backed Up!"] as const;
export const numericValues = ["$35.99", "$24.89", "$17.38", "$3.15"] as const;

export const examplePages = [
  { id: "editor", label: "Editor" },
  { id: "words", label: "Words" },
  { id: "button", label: "Button" },
  { id: "numbers", label: "Numbers" },
] as const;

export const carouselItems: CarouselItem[] = examplePages.map(
  (_, index) => index
);

export const stepForward = (index: number, length: number) =>
  (index + 1) % length;

export const stepBackward = (index: number, length: number) =>
  (index - 1 + length) % length;

export type ExamplePage = (typeof examplePages)[number];
export type ExamplePageId = (typeof examplePages)[number]["id"];
