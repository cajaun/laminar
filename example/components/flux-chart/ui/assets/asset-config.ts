export type FluxAsset = "ethereum" | "usdc";

export const FLUX_ASSET_CONFIG: Record<FluxAsset, {
  name: string;
  lineColor: string;
  futureLineColor: string;
  fillTopColor: string;
  fillBottomColor: string;
  priceFractionDigits: number;
  balance: string;
  value: string;
}> = {
  ethereum: {
    name: "Ethereum",
    lineColor: "#000000",
    futureLineColor: "#F5F5F5",
    fillTopColor: "#000000",
    fillBottomColor: "#000000",
    priceFractionDigits: 2,
    balance: "0.01017",
    value: "$25.53",
  },
  usdc: {
    name: "USDC",
    lineColor: "#2F86D8",
    futureLineColor: "#DCEAF7",
    fillTopColor: "#2F86D8",
    fillBottomColor: "#2F86D8",
    priceFractionDigits: 3,
    balance: "19.491",
    value: "$19.49",
  },
};
