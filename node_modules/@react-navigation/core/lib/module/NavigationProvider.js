"use strict";

import * as React from 'react';
import { NavigationContext } from "./NavigationContext.js";
import { FocusedRouteKeyContext, IsFocusedContext } from "./useIsFocused.js";

/**
 * Context which holds the route prop for a screen.
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const NavigationRouteContext = /*#__PURE__*/React.createContext(undefined);
/**
 * Component to provide the navigation and route contexts to its children.
 */
export const NamedRouteContextListContext = /*#__PURE__*/React.createContext(undefined);
export function NavigationProvider({
  route,
  navigation,
  children
}) {
  const parentIsFocused = React.useContext(IsFocusedContext);
  const focusedRouteKey = React.useContext(FocusedRouteKeyContext);

  // Mark route as focused only if:
  // - It doesn't have a parent navigator
  // - Parent navigator is focused
  const isFocused = parentIsFocused == null || parentIsFocused ? focusedRouteKey === route.key : false;
  return /*#__PURE__*/_jsx(NavigationRouteContext.Provider, {
    value: route,
    children: /*#__PURE__*/_jsx(NavigationContext.Provider, {
      value: navigation,
      children: /*#__PURE__*/_jsx(IsFocusedContext.Provider, {
        value: isFocused,
        children: children
      })
    })
  });
}
//# sourceMappingURL=NavigationProvider.js.map