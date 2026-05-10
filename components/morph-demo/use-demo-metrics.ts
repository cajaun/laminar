import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type DemoMetrics = {
  readonly width: number;
  readonly height: number;
  readonly horizontalInset: number;
  readonly panelRadius: number;
  readonly buttonHeight: number;
  readonly buttonGap: number;
  readonly buttonPaddingHorizontal: number;
  readonly buttonPaddingVertical: number;
  readonly controlStackGap: number;
  readonly footerPaddingBottom: number;
  readonly pageTopPadding: number;
  readonly previewMinHeight: number;
};

type UseDemoMetricsProps = {
  readonly height: number;
  readonly width: number;
  readonly fontSize: number;
};

export function useDemoMetrics({
  height,
  width,
  fontSize,
}: UseDemoMetricsProps): DemoMetrics {
  const { bottom } = useSafeAreaInsets();

  return useMemo(
    () => {
      const buttonHeight = 50;
      const footerPaddingBottom = bottom * 1.5;

      return {
        width,
        height,
        horizontalInset: 24,
        panelRadius: Math.max(28, Math.min(36, width * 0.075)),
        buttonHeight,
        buttonGap: Math.max(16, width * 0.044),
        buttonPaddingHorizontal: Math.max(22, width * 0.058),
        buttonPaddingVertical: Math.max(10, buttonHeight * 0.18),
        controlStackGap: Math.max(14, Math.min(18, height * 0.022)),
        footerPaddingBottom,
        pageTopPadding: Math.max(height * 0.14, fontSize * 2),
        previewMinHeight: Math.max(height * 0.24, fontSize * 2.1),
      };
    },
    [bottom, fontSize, height, width]
  );
}
