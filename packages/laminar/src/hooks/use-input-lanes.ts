import { useMemo, useRef } from "react";
import {
  getInputLaneSnapshot,
  reconcileInputLanes,
  type InputGlyph,
} from "../model/input-lanes";

type InputLaneLedger = {
  readonly enabled: boolean;
  readonly value: string;
  readonly locale?: string;
  readonly units: readonly string[];
  readonly glyphs: readonly InputGlyph[];
  readonly laneKeys: readonly number[];
  readonly nextSeed: number;
};

export const useInputLanes = (
  value: string,
  units: readonly string[],
  locale?: string,
  caretIndex?: number,
  enabled = true,
) => {
  const snapshot = useMemo(
    () =>
      enabled
        ? getInputLaneSnapshot(units, locale)
        : { laneKeys: [], glyphs: [] },
    [enabled, locale, units],
  );
  const ledgerRef = useRef<InputLaneLedger>({
    enabled,
    value,
    locale,
    units,
    glyphs: snapshot.glyphs,
    laneKeys: snapshot.laneKeys,
    nextSeed: snapshot.laneKeys.length,
  });

  if (
    enabled !== ledgerRef.current.enabled ||
    (enabled &&
      (value !== ledgerRef.current.value || locale !== ledgerRef.current.locale))
  ) {
    if (
      enabled &&
      ledgerRef.current.enabled &&
      locale === ledgerRef.current.locale
    ) {
      const next = reconcileInputLanes(
        ledgerRef.current.units,
        units,
        ledgerRef.current.glyphs,
        snapshot.glyphs,
        ledgerRef.current.laneKeys,
        ledgerRef.current.nextSeed,
        caretIndex,
      );
      ledgerRef.current = {
        enabled,
        value,
        locale,
        units,
        glyphs: snapshot.glyphs,
        laneKeys: next.laneKeys,
        nextSeed: next.nextSeed,
      };
    } else {
      ledgerRef.current = {
        enabled,
        value,
        locale,
        units,
        glyphs: snapshot.glyphs,
        laneKeys: snapshot.laneKeys,
        nextSeed: snapshot.laneKeys.length,
      };
    }
  }

  return {
    units,
    glyphs: snapshot.glyphs,
    laneKeys: ledgerRef.current.laneKeys,
  };
};
