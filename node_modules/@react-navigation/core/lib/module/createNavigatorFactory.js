"use strict";

import * as React from 'react';
import { Group } from "./Group.js";
import { Screen } from "./Screen.js";
import { createComponentForStaticNavigation } from "./StaticNavigation.js";

/**
 * Higher order component to create a `Navigator` and `Screen` pair.
 * Custom navigators should wrap the navigator component in `createNavigator` before exporting.
 *
 * @param Navigator The navigator component to wrap.
 * @returns Factory method to create a `Navigator` and `Screen` pair.
 */
export function createNavigatorFactory(Navigator) {
  const displayName = Navigator.displayName ?? Navigator.name ?? 'Navigator';
  function createNavigator(config) {
    if (config != null) {
      const NavigatorComponent = createComponentForStaticNavigation({
        Navigator,
        Screen,
        Group,
        config
      }, displayName);
      return {
        config,
        with(DecoratorComponent) {
          const WithComponent = () => {
            return /*#__PURE__*/React.createElement(DecoratorComponent, {
              Navigator: NavigatorComponent
            });
          };
          WithComponent.displayName = `${displayName}With`;
          return {
            config,
            getComponent: () => WithComponent
          };
        },
        getComponent() {
          return NavigatorComponent;
        }
      };
    }
    return {
      Navigator,
      Screen,
      Group
    };
  }
  return createNavigator;
}
//# sourceMappingURL=createNavigatorFactory.js.map