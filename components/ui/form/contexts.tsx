import React from "react";
import type { ListStyle } from "./types";

export const defaultItemPadding = {
  paddingVertical: 11,
  paddingHorizontal: 20,
} as const;

export const ListStyleContext = React.createContext<ListStyle>("auto");

export const SectionStyleContext = React.createContext<{
  readonly itemPadding: {
    readonly paddingVertical: number;
    readonly paddingHorizontal: number;
  };
}>({
  itemPadding: defaultItemPadding,
});

export const CardStyleContext = React.createContext<{
  readonly sheet?: boolean;
}>({
  sheet: false,
});
