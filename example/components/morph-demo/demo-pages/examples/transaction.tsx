import React, { useEffect } from "react";
import {
  FormItem,
  Section as FormSection,
  Spacer,
  Text as FormText,
} from "@/components/ui/form";
import { Laminar } from "react-native-laminar";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { SymbolView } from "expo-symbols";
import { PressableScale } from "@/shared/ui/pressable-scale";
import { DemoPageLayout, settingsRow } from "../shared";
import type { DemoMetrics } from "../../use-demo-metrics";
import type { DemoPageProps } from "../types";
import {
  DEFAULT_DEMO_FONT_SIZE,
  useCyclicValueStoreSnapshot,
  useTransactionDemoStore,
} from "../../use-demo-state";
import { useDemoTheme } from "../../demo-theme";

const LIGHT_TRANSACTION_COLORS = {
  "Analyzing Transaction": {
    background: "#E5F4FF",
    color: "#4DAFFF",
    ring: "#B8DFFF",
  },
  "Transaction Safe": {
    background: "#D5F4E1",
    color: "#34C759",
    ring: "#34C759",
  },
  "Transaction Warning": {
    background: "#FDE5E5",
    color: "#FF3F3F",
    ring: "#FF3F3F",
  },
} as const;

const DARK_TRANSACTION_COLORS = {
  "Analyzing Transaction": {
    background: "#173149",
    color: "#64B5FF",
    ring: "#2F86D8",
  },
  "Transaction Safe": {
    background: "#17352A",
    color: "#64D98A",
    ring: "#34C759",
  },
  "Transaction Warning": {
    background: "#3D2023",
    color: "#FF6B6B",
    ring: "#FF3F3F",
  },
} as const;

function TransactionSpinner({ color, ringColor }: { color: string; ringColor: string }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 360,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg
        width={32}
        height={32}
        viewBox="0 0 18 18"
        fill="none"
        accessibilityLabel="Analyzing Transaction"
      >
        <Circle
          cx="9"
          cy="9"
          r="7"
          stroke={ringColor}
          strokeWidth="2.5"
        />
        <Path
          d="M16 9C16 5.13401 12.866 2 9 2"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

type TransactionStore = ReturnType<typeof useTransactionDemoStore>;

const TransactionPreview = React.memo(function TransactionPreview({
  store,
}: {
  readonly store: TransactionStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);
  const theme = useDemoTheme();
  const transactionState = state.value;
  const colors = (theme.isDark
    ? DARK_TRANSACTION_COLORS
    : LIGHT_TRANSACTION_COLORS)[transactionState];

  return (
    <PressableScale
      onPress={store.next}
      style={{
        alignSelf: "center",
        height: 56,
        borderRadius: 36,
        backgroundColor: colors.background,
        paddingHorizontal: 32 * 0.9,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Laminar
        text={transactionState}
        autoSize
        leading={{
          "Analyzing Transaction": (
            <TransactionSpinner
              color={colors.color}
              ringColor={colors.ring}
            />
          ),
          "Transaction Safe": (
            <SymbolView
              name="checkmark.circle.fill"
              size={32}
              tintColor={colors.color}
            />
          ),
          "Transaction Warning": (
            <SymbolView
              name="exclamationmark.triangle.fill"
              size={32}
              tintColor={colors.color}
            />
          ),
        }}
        leadingGap={12}
        animationPreset="default"
        style={{
          color: colors.color,
          fontFamily: "Sf-semibold",
          fontSize: 28,
        }}
      />
    </PressableScale>
  );
});

const TransactionValueRow = React.memo(function TransactionValueRow({
  store,
  theme,
}: {
  readonly store: TransactionStore;
  readonly theme: ReturnType<typeof useDemoTheme>;
  readonly custom?: boolean;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return (
    <FormItem>
      <FormText bold onPress={store.next} style={{ color: theme.tertiary }}>
        Button Text
      </FormText>
      <Spacer />
      <FormText bold numberOfLines={1} style={{ color: theme.accent }}>
        {state.value}
      </FormText>
    </FormItem>
  );
});

const TransactionSettings = React.memo(function TransactionSettings({
  metrics,
  store,
}: {
  readonly metrics: DemoMetrics;
  readonly store: TransactionStore;
}) {
  const theme = useDemoTheme();

  return (
    <FormSection
      outerStyle={{ paddingHorizontal: 0 }}
      style={{ backgroundColor: theme.panel, borderRadius: metrics.panelRadius }}
      separatorInset="content"
    >
      <TransactionValueRow store={store} theme={theme} custom />
      {settingsRow({ label: "Surface", value: "Pressable", theme })}
      {settingsRow({ label: "Auto Size", value: "On", theme })}
    </FormSection>
  );
});

function TransactionPage({ height, width }: DemoPageProps) {
  const store = useTransactionDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={DEFAULT_DEMO_FONT_SIZE}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<TransactionPreview store={store} />}
      settingsStore={store}
      renderSettingsSection={(metrics) => (
        <TransactionSettings metrics={metrics} store={store} />
      )}
    />
  );
}

export const TransactionDemoPage = React.memo(TransactionPage);

