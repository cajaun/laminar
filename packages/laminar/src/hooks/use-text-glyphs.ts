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

type TextGlyphUnit =
  | { readonly kind: "text"; readonly signature: string; readonly value: string }
  | { readonly kind: "element"; readonly signature: string; readonly element: ReactNode };

export const useTextGlyphs = (
  value: string,
  namespace: string,
  leading?: ReactNode,
  leadingKey?: string | number
): readonly GlyphToken[] => {
  const units = useMemo<readonly TextGlyphUnit[]>(
    () => [
      ...(leading
        ? [
            {
              kind: "element",
              signature: `leading:${String(leadingKey ?? "default")}`,
              element: leading,
            } as const,
          ]
        : []),
      ...splitDisplayUnits(value).map((unit) => ({
        kind: "text" as const,
        signature: `text:${unit}`,
        value: unit,
      })),
    ],
    [leading, leadingKey, value]
  );
  const signatures = units.map((unit) => unit.signature);
  const ledgerRef = useRef<TextGlyphLedger>({
    previousValue: value,
    previousSignatures: signatures,
    glyphKeys: units.map((_, index) => `${namespace}:c${index}`),
    nextSeed: units.length,
  });

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

  return useMemo(
    () =>
      units.map((unit, index) => ({
        id: glyphKeys[index],
        kind: unit.kind,
        ...(unit.kind === "text"
          ? { value: normalizeDisplayUnit(unit.value) }
          : { element: unit.element }),
      })),
    [glyphKeys, units]
  );
};
