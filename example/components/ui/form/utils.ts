import React from "react";

export function getFlatChildren(children: React.ReactNode) {
  const allChildren: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      if (child != null) {
        allChildren.push(child);
      }
      return;
    }

    if (child.type === React.Fragment) {
      React.Children.forEach(
        (child.props as { children?: React.ReactNode }).children,
        (fragmentChild) => {
          if (fragmentChild != null) {
            allChildren.push(fragmentChild);
          }
        }
      );
      return;
    }

    allChildren.push(child);
  });

  return allChildren;
}

export function isStringishNode(node: React.ReactNode): boolean {
  let containsStringChildren = typeof node === "string";

  React.Children.forEach(node, (child) => {
    if (typeof child === "string") {
      containsStringChildren = true;
      return;
    }

    if (
      React.isValidElement(child) &&
      typeof child.props === "object" &&
      child.props !== null &&
      "children" in child.props
    ) {
      containsStringChildren = isStringishNode(
        (child.props as { children?: React.ReactNode }).children
      );
    }
  });

  return containsStringChildren;
}

export function isExternalHref(href: unknown) {
  return typeof href === "string" && /^([\w\d_+.-]+:)?\/\//.test(href);
}
