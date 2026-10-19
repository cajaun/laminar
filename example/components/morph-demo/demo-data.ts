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
export const singleIconValues = ["Continue", "Confirm"] as const;
export const multiIconValues = [
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
export const numberValues = ["$1,234", "$12,345", "$1,089", "$980"] as const;

export const numberFlowValues = [
  "$10.06",
  "$20.12",
  "$40.24",
  "$100.60",
  "$201.21",
  "$402.43",
  "$1,006.09",
  "$4,024.39",
  "$8,048.78",
  "$12,038.41",
  "$15,769.95",
  "$19,278.41",
  "$22,670.18",
  "$26,061.94",
  "$29,453.70",
  "$32,845.47",
  "$36,237.23",
  "$39,628.99",
  "$43,020.75",
  "$49,804.28",
  "$53,196.04",
  "$56,587.81",
  "$59,979.57",
  "$63,371.33",
  "$66,763.09",
  "$73,546.62",
  "$76,938.38",
  "$80,330.15",
  "$87,113.67",
  "$90,505.43",
  "$93,897.20",
  "$97,288.96",
] as const;
export const textIdentityWords = ["Laminar", "Linear", "Lamina"] as const;
export const slotMechanismValues = [
  "$1,234",
  "$1,089",
  "$1,980",
  "$1,305",
] as const;
export const animationLayerValues = ["$1,234", "$1,089", "$1,980", "$1,305"] as const;
export const autoSizeValues = [
  "Run Simulation",
  "Running Simulation",
  "Simulation Done!",
] as const;

export const examplePages = [
  { id: "textIdentity", label: "Text" },
  { id: "animationLayer", label: "Number" },
  { id: "autoSize", label: "Auto Size" },
  { id: "slotsMechanism", label: "Slots" },
  { id: "singleIcon", label: "Single Icon" },
  { id: "multiIcon", label: "Multiple Icons" },
  { id: "editor", label: "Editor" },
  { id: "words", label: "Words" },
  { id: "button", label: "Button" },
  { id: "transaction", label: "Transaction" },
  { id: "confirmation", label: "Confirmation" },
  { id: "numbers", label: "Numbers" },
  { id: "slots", label: "Slots" },
  { id: "numberFlow", label: "Number Flow" },
] as const;

export const componentPages = [
  { id: "ethereum", label: "Ethereum" },
] as const;

export const demoTabGroups = [
  {
    id: "examples",
    label: "Examples",
    pageIds: [
      "numbers",
      "slots",
      "editor",
      "words",
      "button",
      "transaction",
      "confirmation",
      "numberFlow",
    ],
    componentIds: [],
  },
  {
    id: "howItWorks",
    label: "How it works",
    pageIds: [
      "textIdentity",
      "animationLayer",
      "autoSize",
      "slotsMechanism",
      "singleIcon",
      "multiIcon",
    ],
    componentIds: [],
  },
  {
    id: "components",
    label: "Components",
    pageIds: [],
    componentIds: ["ethereum"],
  },
] as const;

export type DemoTabGroup = (typeof demoTabGroups)[number];

export const stepForward = (index: number, length: number) =>
  (index + 1) % length;

export const stepBackward = (index: number, length: number) =>
  (index - 1 + length) % length;

export type ExamplePage = (typeof examplePages)[number];
export type ExamplePageId = (typeof examplePages)[number]["id"];
export type ComponentPage = (typeof componentPages)[number];
export type ComponentPageId = (typeof componentPages)[number]["id"];
