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
import {
  AnimationLayerDemoPage,
  AutoSizeDemoPage,
  ButtonDemoPage,
  EditorDemoPage,
  NumbersDemoPage,
  NumberIdentityDemoPage,
  NumberFlowDemoPage,
  SlotsDemoPage,
  SlotsNextDemoPage,
  TextIdentityDemoPage,
  TransactionDemoPage,
  WordsDemoPage,
} from "./demo-pages";

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
  const page = examplePages[pageIndex] ?? examplePages[0];

  const content =
    page.id === "textIdentity" ? (
      <TextIdentityDemoPage width={width} height={height} />
    ) : page.id === "numberIdentity" ? (
      <NumberIdentityDemoPage width={width} height={height} />
    ) : page.id === "animationLayer" ? (
      <AnimationLayerDemoPage width={width} height={height} />
    ) : page.id === "autoSize" ? (
      <AutoSizeDemoPage width={width} height={height} />
    ) : page.id === "editor" ? (
      <EditorDemoPage width={width} height={height} />
    ) : page.id === "words" ? (
      <WordsDemoPage width={width} height={height} />
    ) : page.id === "button" ? (
      <ButtonDemoPage width={width} height={height} />
    ) : page.id === "transaction" ? (
      <TransactionDemoPage width={width} height={height} />
    ) : page.id === "slots" ? (
      <SlotsDemoPage width={width} height={height} />
    ) : page.id === "slotsNext" ? (
      <SlotsNextDemoPage width={width} height={height} />
    ) : page.id === "numberFlow" ? (
      <NumberFlowDemoPage width={width} height={height} />
    ) : (
      <NumbersDemoPage width={width} height={height} />
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View
        style={{
          height: 58,
          paddingHorizontal: 24,
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

      <View style={{ flex: 1 }}>{content}</View>
    </SafeAreaView>
  );
}
