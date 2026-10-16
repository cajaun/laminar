import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link as FormLink, Section as FormSection } from "@/components/ui/form";
import { ScreenScrollView } from "@/components/ui/screen-scroll-view";
import { useHeaderHeight } from "@/helpers/use-header-height";
import { examplePages, type ExamplePageId } from "./demo-data";
import {
  AnimationLayerDemoPage,
  AutoSizeDemoPage,
  ButtonDemoPage,
  ConfirmationDemoPage,
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
  paddingBottom: 28,
} as const;

export function MorphDemoScreen() {
  return (
    <ScreenScrollView contentContainerStyle={catalogContentStyle}>
      <View style={{ height: 16 }} />
      <FormSection
        outerStyle={{ paddingHorizontal: 0 }}
        style={{ backgroundColor: "#f7f7f7", borderRadius: 28 }}
        separatorInset="content"
      >
        {examplePages.map((page) => (
          <FormLink
            key={page.id}
            bold
            href={{
              pathname: "/laminar-demo/[demo]",
              params: { demo: page.id },
            }}
          >
            {page.label}
          </FormLink>
        ))}
      </FormSection>
    </ScreenScrollView>
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
  const headerHeight = useHeaderHeight();
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
    ) : page.id === "confirmation" ? (
      <ConfirmationDemoPage width={width} height={height} />
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
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
    >
      <View style={{ flex: 1, paddingTop: headerHeight }}>{content}</View>
    </SafeAreaView>
  );
}
