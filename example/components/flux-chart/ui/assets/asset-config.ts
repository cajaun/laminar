export type FluxAsset = "ethereum";

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
    balance: "0.3687",
    value: "$891.43",
  },
};
