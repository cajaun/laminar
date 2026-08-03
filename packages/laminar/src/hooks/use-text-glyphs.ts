import { useMemo, useRef, type ReactNode } from "react";
import {
  normalizeDisplayUnit,
  splitDisplayUnits,
} from "../model/display-units";
import { reconcileTextGlyphKeys } from "../model/text-keys";
import type { GlyphToken } from "../types";

type TextGlyphLedger = {
  previousValue: string;
  previousSignatures: readonly string[];
  glyphKeys: readonly string[];
  nextSeed: number;
};

type TextGlyphUnit = {
  readonly kind: "text";
  readonly signature: string;
  readonly value: string;
};

// build text glyphs independently, then prepend a separately keyed leading token
export const useTextGlyphs = (
  value: string,
  namespace: string,
  leading?: ReactNode,
  leadingKey?: string | number
): readonly GlyphToken[] => {
  // Reconcile text independently so inserting/removing a leading token cannot
  // change which repeated text glyphs the LCS ledger preserves.
  const textUnits = useMemo<readonly TextGlyphUnit[]>(
    () => [
      ...splitDisplayUnits(value).map((unit) => ({
        kind: "text" as const,
        signature: `text:${unit}`,
        value: unit,
      })),
    ],
    [value]
  );
  const signatures = textUnits.map((unit) => unit.signature);
  const ledgerRef = useRef<TextGlyphLedger>({
    previousValue: value,
    previousSignatures: signatures,
    glyphKeys: textUnits.map((_, index) => `${namespace}:c${index}`),
    nextSeed: textUnits.length,
  });

  // reconcile only when a token signature changes so stable glyphs keep their views
  if (
    value !== ledgerRef.current.previousValue ||
    signatures.length !== ledgerRef.current.previousSignatures.length ||
    signatures.some(
      (signature, index) => signature !== ledgerRef.current.previousSignatures[index]
    )
  ) {
    // keep ids stable so unchanged glyphs stay mounted between updates
    const nextLedger = reconcileTextGlyphKeys(
      ledgerRef.current.previousSignatures,
      signatures,
      ledgerRef.current.glyphKeys,
      ledgerRef.current.nextSeed,
      namespace
    );

    ledgerRef.current = {
      previousValue: value,
      previousSignatures: signatures,
      glyphKeys: nextLedger.glyphKeys,
      nextSeed: nextLedger.nextSeed,
    };
  }

  const glyphKeys = ledgerRef.current.glyphKeys;

  // normalize spaces at the edge where tokens become renderable glyphs, then
  // prepend the leading token with an identity that is independent of text
  return useMemo(
    () => {
      const textGlyphs = textUnits.map((unit, index) => ({
        id: glyphKeys[index],
        kind: "text" as const,
        value: normalizeDisplayUnit(unit.value),
      }));

      if (!leading) {
        return textGlyphs;
      }

      return [
        {
          id: `${namespace}:leading:${String(leadingKey ?? "default")}`,
          kind: "element" as const,
          element: leading,
        },
        ...textGlyphs,
      ];
    },
    [glyphKeys, leading, leadingKey, namespace, textUnits]
  );
};
