import React from "react";
import type { ListStyle } from "./types";

export const defaultItemPadding = {
  paddingVertical: 11,
  paddingHorizontal: 20,
} as const;

export const defaultMinRowHeight = 44;

export const ListStyleContext = React.createContext<ListStyle>("auto");

export const SectionStyleContext = React.createContext<{
  readonly itemPadding: {
    readonly paddingVertical: number;
    readonly paddingHorizontal: number;
  };
  readonly minRowHeight: number;
}>({
  itemPadding: defaultItemPadding,
  minRowHeight: defaultMinRowHeight,
});

export const CardStyleContext = React.createContext<{
  readonly sheet?: boolean;
}>({
  sheet: false,
});
