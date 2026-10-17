import React, { useRef } from "react";
import { FlatList, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { Link as FormLink, Section as FormSection } from "@/components/ui/form";
import { ScreenScrollView } from "@/components/ui/screen-scroll-view";
import { useHeaderHeight } from "@/helpers/use-header-height";
import {
  componentPages,
  demoTabGroups,
  examplePages,
  type ComponentPageId,
  type DemoTabGroup,
  type ExamplePageId,
} from "./demo-data";
import { useDemoTheme } from "./demo-theme";
import { TopTabs, type TopTab } from "./top-tabs";
import { demoPageComponents } from "./demo-pages";

const catalogContentStyle = {
  paddingHorizontal: 0,
  paddingBottom: 28,
} as const;

export function MorphDemoScreen() {
  const theme = useDemoTheme();
  const { width: windowWidth } = useWindowDimensions();
  const pageWidth = windowWidth;
  const horizontalListRef = useRef<FlatList<any>>(null);
  const indexDecimal = useSharedValue(0);
  const isPagerScrolling = useSharedValue(false);
  const hasPagerInteraction = useSharedValue(false);
  const pagesById = new Map(examplePages.map((page) => [page.id, page]));
  const componentPagesById = new Map(
    componentPages.map((page) => [page.id, page]),
  );

  const renderDemoLink = (pageId: ExamplePageId) => {
    const page = pagesById.get(pageId);

    return page ? (
      <FormLink
        key={page.id}
        bold
        style={{ color: theme.primary }}
        href={{
          pathname: "/laminar-demo/[demo]",
          params: { demo: page.id },
        }}
      >
        {page.label}
      </FormLink>
    ) : null;
  };

  const renderComponentLink = (componentId: ComponentPageId) => {
    const component = componentPagesById.get(componentId);

    return component ? (
      <FormLink
        key={component.id}
        bold
        style={{ color: theme.primary }}
        href={{
          pathname: "/chart",
          params: { asset: component.id },
        }}
      >
        {component.label}
      </FormLink>
    ) : null;
  };

  const renderPageList = (group: DemoTabGroup) => (
    <FormSection
      outerStyle={{ paddingHorizontal: 20 }}
      style={{
        backgroundColor: theme.catalogPanel,
        borderRadius: 28,
      }}
      separatorInset="content"
    >
      {group.id === "components"
        ? group.componentIds.map(renderComponentLink)
        : group.pageIds.map(renderDemoLink)}
    </FormSection>
  );

  const tabs: TopTab[] = demoTabGroups.map((group, index) => ({
    label: group.label,
    value: index,
  }));
  const pages = demoTabGroups.map(renderPageList);
  const horizontalScrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      hasPagerInteraction.value = true;
      isPagerScrolling.value = true;
    },
    onMomentumBegin: () => {
      isPagerScrolling.value = true;
    },
    onScroll: (event) => {
      indexDecimal.value =
        pageWidth === 0 ? 0 : event.contentOffset.x / pageWidth;
    },
    onMomentumEnd: () => {
      isPagerScrolling.value = false;
    },
  });

  return (
    <ScreenScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={catalogContentStyle}
    >
      <View style={{ height: 16 }} />
      <TopTabs
        tabs={tabs}
        indexDecimal={indexDecimal}
        isPagerScrolling={isPagerScrolling}
        hasPagerInteraction={hasPagerInteraction}
        onTabPress={(index) => {
          hasPagerInteraction.value = true;
          if (Math.round(indexDecimal.value) === index) {
            isPagerScrolling.value = false;
            return;
          }

          isPagerScrolling.value = true;
          horizontalListRef.current?.scrollToOffset({
            offset: index * pageWidth,
            animated: true,
          });
        }}
      />
      <Animated.FlatList
        ref={horizontalListRef}
        data={pages}
        horizontal
        pagingEnabled
        bounces={false}
        initialNumToRender={pages.length}
        windowSize={pages.length}
        removeClippedSubviews={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={horizontalScrollHandler}
        keyExtractor={(_, index) =>
          tabs[index]?.value.toString() ?? String(index)
        }
        style={{ width: pageWidth, flexGrow: 0, marginTop: 8 }}
        renderItem={({ item }) => <View style={{ width: pageWidth }}>{item}</View>}
      />
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
  const theme = useDemoTheme();
  const headerHeight = useHeaderHeight();
  const requestedPageIndex = examplePages.findIndex(
    (page) => page.id === pageId,
  );
  const pageIndex = requestedPageIndex >= 0 ? requestedPageIndex : 0;
  const page = examplePages[pageIndex] ?? examplePages[0];

  const DemoPage = demoPageComponents[page.id];
  const content = <DemoPage width={width} height={height} />;

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <View style={{ flex: 1, paddingTop: headerHeight }}>{content}</View>
    </SafeAreaView>
  );
}
