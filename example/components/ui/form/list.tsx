import React from "react";
import {
  Platform,
  RefreshControl,
  ScrollView as RNScrollView,
  StyleSheet,
} from "react-native";
import type { ScrollViewProps } from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formColors } from "./colors";
import { CardStyleContext, ListStyleContext } from "./contexts";
import { RefreshContextProvider, useRefreshContext } from "./refresh";
import type { ListStyle } from "./types";

export type ListProps = ScrollViewProps & {
  readonly navigationTitle?: string;
  readonly listStyle?: ListStyle;
  readonly sheet?: boolean;
  readonly contentContainerClassName?: string;
  readonly className?: string;
};

export function List(props: ListProps) {
  return (
    <RefreshContextProvider>
      <CardStyleContext.Provider value={{ sheet: props.sheet }}>
        <InnerList {...props} />
      </CardStyleContext.Provider>
    </RefreshContextProvider>
  );
}

if (__DEV__) List.displayName = "FormList";

export function ScrollView({
  style,
  contentContainerStyle,
  className: _className,
  contentContainerClassName: _contentContainerClassName,
  ...props
}: ScrollViewProps & {
  readonly className?: string;
  readonly contentContainerClassName?: string;
}) {
  const { bottom } = useSafeAreaInsets();
  const { sheet } = React.useContext(CardStyleContext);

  return (
    <RNScrollView
      scrollToOverflowEnabled
      automaticallyAdjustsScrollIndicatorInsets
      contentInsetAdjustmentBehavior="automatic"
      scrollIndicatorInsets={{
        bottom: Platform.OS === "ios" ? bottom : 0,
      }}
      {...props}
      style={[
        {
          backgroundColor: sheet
            ? "transparent"
            : formColors.groupedBackground,
        },
        style,
      ]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
    />
  );
}

function InnerList({
  navigationTitle,
  listStyle,
  sheet: _sheet,
  contentContainerStyle,
  ...props
}: ListProps) {
  const { hasSubscribers, refreshing, refresh } = useRefreshContext();

  return (
    <>
      {navigationTitle ? (
        <Stack.Screen options={{ title: navigationTitle }} />
      ) : null}
      <ListStyleContext.Provider value={listStyle ?? "auto"}>
        <ScrollView
          contentContainerStyle={[styles.innerContent, contentContainerStyle]}
          refreshControl={
            hasSubscribers ? (
              <RefreshControl refreshing={refreshing} onRefresh={refresh} />
            ) : undefined
          }
          {...props}
        />
      </ListStyleContext.Provider>
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  innerContent: {
    paddingVertical: 16,
    gap: 24,
  },
});
