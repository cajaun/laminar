import React, { useCallback } from "react";
import { Link } from "expo-router";
import {
  FlatList,
  Pressable,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { examplePages, type ExamplePageId } from "./demo-data";
import { DemoFooter, DemoPageScroll } from "./demo-chrome";
import {
  AnimationLayerDemoPage,
  AutoSizeDemoPage,
  ButtonDemoPage,
  EditorDemoPage,
  NumbersDemoPage,
  NumberIdentityDemoPage,
  NumberFlowDemoPage,
  SlotsDemoPage,
  TextIdentityDemoPage,
  TransactionDemoPage,
  WordsDemoPage,
} from "./demo-pages";
import { useDemoMetrics } from "./use-demo-metrics";
import { useDemoState } from "./use-demo-state";

const catalogContentStyle = {
  paddingHorizontal: 20,
  paddingBottom: 28,
} as const;

type DemoCatalogRowProps = {
  readonly id: ExamplePageId;
  readonly label: string;
};

const DemoCatalogRow = React.memo(function DemoCatalogRow({
  id,
  label,
}: DemoCatalogRowProps) {
  return (
    <Link
      href={{ pathname: "/laminar-demo/[demo]", params: { demo: id } }}
      asChild
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${label} demo`}
        style={({ pressed }) => [
          {
            minHeight: 72,
            marginTop: 12,
            paddingHorizontal: 20,
            borderRadius: 22,
            justifyContent: "center",
            backgroundColor: "#F3F4F6",
          },
          pressed ? { opacity: 0.7 } : undefined,
        ]}
      >
        <Text
          style={{
            color: "#111318",
            fontFamily: "Sf-bold",
            fontSize: 20,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            marginTop: 3,
            color: "#8E8E93",
            fontFamily: "Sf-medium",
            fontSize: 14,
          }}
        >
          Open isolated demo
        </Text>
      </Pressable>
    </Link>
  );
});

export function MorphDemoScreen() {
  const renderItem = useCallback<ListRenderItem<(typeof examplePages)[number]>>(
    ({ item }) => <DemoCatalogRow id={item.id} label={item.label} />,
    [],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <FlatList
        data={examplePages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: 84,
          offset: 84 * index,
          index,
        })}
        contentContainerStyle={catalogContentStyle}
        ListHeaderComponent={
          <View style={{ paddingTop: 18, paddingBottom: 8 }}>
            <Text
              style={{
                color: "#111318",
                fontFamily: "Sf-bold",
                fontSize: 34,
              }}
            >
              Laminar demos
            </Text>
            <Text
              style={{
                marginTop: 8,
                color: "#8E8E93",
                fontFamily: "Sf-medium",
                fontSize: 17,
                lineHeight: 23,
              }}
            >
              Choose one demo. Only the selected demo is mounted.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

type DemoDetailScreenProps = {
  readonly pageId: ExamplePageId;
  readonly height: number;
  readonly width: number;
};

export function DemoDetailScreen({
  pageId,
  height,
  width,
}: DemoDetailScreenProps) {
  const requestedPageIndex = examplePages.findIndex(
    (page) => page.id === pageId,
  );
  const pageIndex = requestedPageIndex >= 0 ? requestedPageIndex : 0;
  const state = useDemoState(pageIndex);
  const metrics = useDemoMetrics({
    height,
    width,
    fontSize: state.fontSize,
  });
  const page = examplePages[pageIndex] ?? examplePages[0];

  const content =
    page.id === "textIdentity" ? (
      <TextIdentityDemoPage metrics={metrics} state={state} />
    ) : page.id === "numberIdentity" ? (
      <NumberIdentityDemoPage metrics={metrics} state={state} />
    ) : page.id === "animationLayer" ? (
      <AnimationLayerDemoPage metrics={metrics} state={state} />
    ) : page.id === "autoSize" ? (
      <AutoSizeDemoPage metrics={metrics} state={state} />
    ) : page.id === "editor" ? (
      <EditorDemoPage metrics={metrics} state={state} />
    ) : page.id === "words" ? (
      <WordsDemoPage metrics={metrics} state={state} />
    ) : page.id === "button" ? (
      <ButtonDemoPage metrics={metrics} state={state} />
    ) : page.id === "transaction" ? (
      <TransactionDemoPage metrics={metrics} state={state} />
    ) : page.id === "slots" ? (
      <SlotsDemoPage metrics={metrics} state={state} />
    ) : page.id === "numberFlow" ? (
      <NumberFlowDemoPage metrics={metrics} state={state} />
    ) : (
      <NumbersDemoPage metrics={metrics} state={state} />
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View
        style={{
          height: 58,
          paddingHorizontal: metrics.horizontalInset,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: "#F1F1F1",
        }}
      >
        <Link href="/laminar" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Laminar demos"
          >
            <Text
              style={{
                color: "#007AFF",
                fontFamily: "Sf-semibold",
                fontSize: 16,
              }}
            >
              Demos
            </Text>
          </Pressable>
        </Link>
        <Text
          style={{
            color: "#111318",
            fontFamily: "Sf-bold",
            fontSize: 17,
          }}
        >
          {page.label}
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={{ flex: 1 }}>
        <DemoPageScroll metrics={metrics}>{content}</DemoPageScroll>
      </View>

      <DemoFooter
        metrics={metrics}
        onReverse={state.reverse}
        onMorph={state.morph}
      />
    </SafeAreaView>
  );
}
