import {
  EventArg,
  NavigationProp,
  useNavigation,
  useRoute,
} from "@react-navigation/core";
import * as React from "react";
import type { ScrollView } from "react-native";
import type { WebView } from "react-native-webview";

type ScrollOptions = { x?: number; y?: number; animated?: boolean };

type ScrollableView =
  | { scrollToTop(): void }
  | { scrollTo(options: ScrollOptions): void }
  | { scrollToOffset(options: { offset?: number; animated?: boolean }): void }
  | { scrollResponderScrollTo(options: ScrollOptions): void };

type ScrollableWrapper =
  | { getScrollResponder(): React.ReactNode | ScrollView }
  | { getNode(): ScrollableView }
  | ScrollableView;

function getScrollableNode(
  ref: React.RefObject<ScrollableWrapper> | React.RefObject<WebView>
) {
  if (ref?.current == null) {
    return null;
  }

  if (
    "scrollToTop" in ref.current ||
    "scrollTo" in ref.current ||
    "scrollToOffset" in ref.current ||
    "scrollResponderScrollTo" in ref.current
  ) {
    // This is already a scrollable node.
    return ref.current;
  } else if ("getScrollResponder" in ref.current) {
    // If the view is a wrapper like FlatList, SectionList etc.
    // We need to use `getScrollResponder` to get access to the scroll responder
    return ref.current.getScrollResponder();
  } else if ("getNode" in ref.current) {
    // When a `ScrollView` is wrapped in `Animated.createAnimatedComponent`
    // we need to use `getNode` to get the ref to the actual scrollview.
    // Note that `getNode` is deprecated in newer versions of react-native
    // this is why we check if we already have a scrollable node above.
    return ref.current.getNode();
  } else {
    return ref.current;
  }
}

export function useScrollToTop(
  ref: React.RefObject<ScrollableWrapper> | React.RefObject<WebView>,
  offset: number = 0
) {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();

  React.useEffect(() => {
    let tabNavigations: NavigationProp<any>[] = [];
    let currentNavigation: NavigationProp<any> | undefined = navigation;

    // Find all parent tab navigations
    while (currentNavigation) {
      if (currentNavigation.getState()?.type === "tab") {
        tabNavigations.push(currentNavigation);
      }
      currentNavigation = currentNavigation.getParent();
    }

    if (tabNavigations.length === 0) {
      return;
    }

    const unsubscribers = tabNavigations.map((tab) =>
      tab.addListener("tabPress", (e: EventArg<"tabPress", true>) => {
        const isFocused = navigation.isFocused();
        const isFirst =
          tabNavigations.includes(navigation) ||
          navigation.getState()?.routes[0].key === route.key;

        requestAnimationFrame(() => {
          const scrollable = getScrollableNode(ref);

          if (isFocused && isFirst && scrollable && !e.defaultPrevented) {
            if ("scrollToTop" in scrollable) {
              scrollable.scrollToTop();
            } else if ("scrollTo" in scrollable) {
              scrollable.scrollTo({ y: offset, animated: true });
            } else if ("scrollToOffset" in scrollable) {
              scrollable.scrollToOffset({ offset, animated: true });
            } else if ("scrollResponderScrollTo" in scrollable) {
              scrollable.scrollResponderScrollTo({ y: offset, animated: true });
            } else if ("injectJavaScript" in scrollable) {
              scrollable.injectJavaScript(
                `;window.scrollTo({ top: ${offset}, behavior: 'smooth' }); true;`
              );
            }
          }
        });
      })
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [navigation, ref, offset, route.key]);
}

export const useScrollRef =
  process.env.EXPO_OS === "web"
    ? () => undefined
    : () => {
        const ref = React.useRef<ScrollableWrapper | WebView>(null);
        useScrollToTop(ref);
        return ref;
      };
