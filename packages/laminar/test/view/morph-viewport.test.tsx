import React from "react";
import { StyleSheet, Text, View } from "react-native";
import TestRenderer, { act } from "react-test-renderer";
import { MorphViewport } from "../../src/view/morph-viewport";

const renderViewport = (
  props: Partial<React.ComponentProps<typeof MorphViewport>> = {}
) => {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(
      <MorphViewport
        autoSize
        clipToBounds={false}
        align="left"
        measurement={<Text>measure</Text>}
        {...props}
      >
        <Text>visible</Text>
      </MorphViewport>
    );
  });
  return renderer;
};

describe("MorphViewport", () => {
  test.each([
    ["MV-DT-001 left", "left", "flex-start", "flex-start"],
    ["MV-DT-002 center", "center", "center", "center"],
    ["MV-DT-003 right", "right", "flex-end", "flex-end"],
  ] as const)(
    "%s maps shell and viewport alignment",
    (_id, align, shellAlignment, childAlignment) => {
      const renderer = renderViewport({ align });
      const views = renderer.root.findAllByType(View);

      expect(StyleSheet.flatten(views[0].props.style).alignSelf).toBe(
        shellAlignment
      );
      expect(StyleSheet.flatten(views[2].props.style).alignItems).toBe(
        childAlignment
      );
    }
  );

  test("MV-DT-004 auto-size isolates measurement from touch and accessibility", () => {
    const renderer = renderViewport();
    const measurementOwner = renderer.root
      .findAllByType(View)
      .find((view) => view.props.pointerEvents === "none");

    expect(measurementOwner?.props).toMatchObject({
      accessibilityElementsHidden: true,
      collapsable: false,
      importantForAccessibility: "no-hide-descendants",
      pointerEvents: "none",
    });
    expect(StyleSheet.flatten(measurementOwner?.props.style)).toMatchObject({
      position: "absolute",
      opacity: 0,
    });
  });

  test.each([
    ["MV-DT-005 clipped", true, "hidden"],
    ["MV-DT-006 unclipped", false, "visible"],
  ])("%s controls overflow", (_id, clipToBounds, overflow) => {
    const renderer = renderViewport({ clipToBounds });
    const animatedViewport = renderer.root.findAllByType(View)[2];

    expect(StyleSheet.flatten(animatedViewport.props.style).overflow).toBe(
      overflow
    );
  });

  test("MV-DT-007 disabled auto-size omits measurement and fills width", () => {
    const renderer = renderViewport({ autoSize: false });
    const views = renderer.root.findAllByType(View);

    expect(renderer.root.findAllByProps({ children: "measure" })).toHaveLength(0);
    expect(StyleSheet.flatten(views[1].props.style).width).toBe("100%");
  });
});
