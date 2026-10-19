import React from "react";
import { Text, View, type TextStyle } from "react-native";
import { Laminar } from "react-native-laminar";
import type { MorphNumberMode } from "react-native-laminar";
import type { SharedValue } from "react-native-reanimated";
import type { RangeMeta } from "@/components/morphing-chart/data/chart-data";
import type { MorphingAsset } from "@/components/morphing-chart/ui/assets/asset-config";
import { REFERENCE_GREEN } from "@/components/morphing-chart/core/model/chart-config";
import {
  formatPercent,
} from "@/components/morphing-chart/core/model/chart-formatters";
import { getCursorDisplayPercent } from "@/components/morphing-chart/core/model/cursor-values";
import { SFIcon } from "@/components/morphing-chart/ui/primitives/sf-icon";
import { useMorphingChartTheme } from "@/components/morphing-chart/ui/morphing-chart-theme";

const fullReadoutContainerStyle = { width: "100%" } as const;
const priceFormatters = new Map<number, Intl.NumberFormat>();
const formattedPriceValuesCache = new WeakMap<
  readonly number[],
  Map<number, readonly string[]>
>();

function formatPrice(value: number, fractionDigits: number) {
  let formatter = priceFormatters.get(fractionDigits);

  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    priceFormatters.set(fractionDigits, formatter);
  }

  return `$${formatter.format(value)}`;
}

// reuse formatted ticker strings across scrub sessions
function formatPriceValues(
  values: readonly number[],
  fractionDigits: number,
): readonly string[] {
  let fractionCache = formattedPriceValuesCache.get(values);

  if (!fractionCache) {
    fractionCache = new Map();
    formattedPriceValuesCache.set(values, fractionCache);
  }

  const cached = fractionCache.get(fractionDigits);
  if (cached) return cached;

  const next = values.map((value) => formatPrice(value, fractionDigits));
  fractionCache.set(fractionDigits, next);
  return next;
}

// Keep the inactive slots renderer at the last settled value while ticker
// mode follows the cursor through its shared value on the UI thread.
function useSlotsPreloadValue(value: string, numberMode: MorphNumberMode) {
  const settledValueRef = React.useRef(value);
  if (numberMode !== "ticker") {
    settledValueRef.current = value;
  }

  return numberMode === "ticker" ? settledValueRef.current : value;
}

type PriceOverviewProps = {
  asset: MorphingAsset;
  cursorIndexShared: SharedValue<number>;
  displayValue: number;
  meta: RangeMeta;
  numberMode: MorphNumberMode;
  priceFractionDigits: number;
  slotStartValue: number | null;
  tickerValues: readonly number[] | null;
  width: number;
};

export const PriceOverview = React.memo(function PriceOverview({
  asset,
  cursorIndexShared,
  displayValue,
  meta,
  numberMode,
  priceFractionDigits,
  slotStartValue,
  tickerValues,
  width,
}: PriceOverviewProps) {
  const theme = useMorphingChartTheme();
  return (
    <View
      className="mt-6 flex-row items-end justify-between"
      style={{ width }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <PriceIdentity asset={asset} color={theme.primary} />
        <PriceReadout
          cursorIndexShared={cursorIndexShared}
          displayValue={displayValue}
          numberMode={numberMode}
          priceFractionDigits={priceFractionDigits}
          slotStartValue={slotStartValue}
          tickerValues={tickerValues}
          color={theme.primary}
          backgroundColor={theme.background}
        />
      </View>
      <PercentReadout
        cursorIndexShared={cursorIndexShared}
        displayValue={displayValue}
        meta={meta}
        numberMode={numberMode}
        tickerValues={tickerValues}
        backgroundColor={theme.background}
        slotStartValue={slotStartValue}
      />
    </View>
  );
});

PriceOverview.displayName = "PriceOverview";

type PriceIdentityProps = {
  asset: MorphingAsset;
  color: string;
};

const PriceIdentity = React.memo(function PriceIdentity({
  asset,
  color,
}: PriceIdentityProps) {
  return (
    <View className="mb-0.5 flex-row items-center gap-2">
      <Text
        className="font-sf-bold text-[30px] leading-9"
        style={{ color }}
      >
        Ethereum
      </Text>
      {asset === "ethereum" ? (
        <SFIcon
          name="checkmark.seal.fill"
          size={31}
          color="#4CAEFF"
          weight="bold"
          fallback="✓"
          fallbackSize={25}
        />
      ) : null}
    </View>
  );
});

PriceIdentity.displayName = "PriceIdentity";

type NumericReadoutProps = {
  cursorIndexShared: SharedValue<number>;
  displayValue: number;
  meta: RangeMeta;
  numberMode: MorphNumberMode;
  priceFractionDigits: number;
  slotStartValue: number | null;
  tickerValues: readonly number[] | null;
  backgroundColor: string;
};

const PriceReadout = React.memo(function PriceReadout({
  cursorIndexShared,
  displayValue,
  numberMode,
  priceFractionDigits,
  slotStartValue,
  tickerValues,
  color,
  backgroundColor,
}: Omit<NumericReadoutProps, "meta"> & { color: string }) {
  const priceText = formatPrice(displayValue, priceFractionDigits);
  const slotsPreloadValue = useSlotsPreloadValue(priceText, numberMode);
  const tickerPriceValues = React.useMemo(
    () =>
      tickerValues
        ? formatPriceValues(tickerValues, priceFractionDigits)
        : [],
    [priceFractionDigits, tickerValues],
  );
  const animatedPriceText = React.useMemo(
    () =>
      numberMode === "ticker" && tickerPriceValues.length > 0
        ? { index: cursorIndexShared, values: tickerPriceValues }
        : undefined,
    [cursorIndexShared, numberMode, tickerPriceValues],
  );
  const slotStartPriceText = React.useMemo(
    () =>
      slotStartValue === null
        ? undefined
        : formatPrice(slotStartValue, priceFractionDigits),
    [priceFractionDigits, slotStartValue],
  );
  const priceTextStyle: TextStyle = React.useMemo(
    () => ({
      color,
      fontVariant: ["tabular-nums"],
      fontFamily: "Sf-bold",
      fontWeight: "700" as const,
      letterSpacing: -1.5,
      lineHeight: 36,
    }),
    [color],
  );
  const numberShadow = React.useMemo(
    () => ({ color: backgroundColor }),
    [backgroundColor],
  );

  return (
    <Laminar
      animatedText={animatedPriceText}
      fromValue={slotStartPriceText}
      preloadValue={slotsPreloadValue}
      text={priceText}
      variant="number"
      numberMode={numberMode}
      align="left"
      autoSize
      clipToBounds={false}
      fontSize={30}
      shadow={numberShadow}
      containerStyle={fullReadoutContainerStyle}
      style={priceTextStyle}
    />
  );
});

PriceReadout.displayName = "PriceReadout";

const PercentReadout = React.memo(function PercentReadout({
  cursorIndexShared,
  displayValue,
  meta,
  numberMode,
  tickerValues,
  slotStartValue,
  backgroundColor,
}: Omit<NumericReadoutProps, "priceFractionDigits">) {
  const displayPercentChange = getCursorDisplayPercent(
    meta.percentChange,
    meta.totalValue,
    displayValue,
  );
  const percentText = formatPercent(displayPercentChange);
  const slotsPreloadValue = useSlotsPreloadValue(percentText, numberMode);
  const slotStartPercentText = React.useMemo(
    () =>
      slotStartValue === null
        ? undefined
        : formatPercent(
            getCursorDisplayPercent(
              meta.percentChange,
              meta.totalValue,
              slotStartValue,
            ),
          ),
    [meta.percentChange, meta.totalValue, slotStartValue],
  );
  const tickerPercentValues = React.useMemo(
    () =>
      tickerValues?.map((value) =>
        formatPercent(
          getCursorDisplayPercent(meta.percentChange, meta.totalValue, value),
        ),
      ) ?? [],
    [meta.percentChange, meta.totalValue, tickerValues],
  );
  const animatedPercentText = React.useMemo(
    () =>
      numberMode === "ticker" && tickerPercentValues.length > 0
        ? { index: cursorIndexShared, values: tickerPercentValues }
        : undefined,
    [cursorIndexShared, numberMode, tickerPercentValues],
  );
  const percentTextStyle: TextStyle = React.useMemo(
    () => ({
      color: REFERENCE_GREEN,
      fontVariant: ["tabular-nums"],
      fontFamily: "Sf-bold",
      fontWeight: "700" as const,
      letterSpacing: -1.5,
      lineHeight: 36,
    }),
    [],
  );
  const numberShadow = React.useMemo(
    () => ({ color: backgroundColor }),
    [backgroundColor],
  );
  const percentLeading = React.useMemo(
    () => (
      <SFIcon
        name="arrow.up"
        size={20}
        color={REFERENCE_GREEN}
        weight="semibold"
        fallback="↑"
        fallbackSize={20}
      />
    ),
    [],
  );
  return (
    <View className="items-end pb-1.25" style={{ flexShrink: 0 }}>
      <Laminar
        animatedText={animatedPercentText}
        fromValue={slotStartPercentText}
        preloadValue={slotsPreloadValue}
        text={percentText}
        variant="number"
        numberMode={numberMode}
        align="right"
        leading={percentLeading}
        leadingGap={4}
        autoSize
        clipToBounds={false}
        fontSize={30}
        shadow={numberShadow}
        style={percentTextStyle}
      />
    </View>
  );
});

PercentReadout.displayName = "PercentReadout";
