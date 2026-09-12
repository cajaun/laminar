import React from "react";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native";
import TestRenderer, { act } from "react-test-renderer";
import { SlotShadow } from "../../src/view/slot-shadow";

type SlotShadowProps = React.ComponentProps<typeof SlotShadow>;

const renderShadow = (
  props: Omit<Partial<SlotShadowProps>, "children"> = {}
) => {
  let renderer!: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      <SlotShadow slotHeight={20} viewportHeight={40} {...props}>
        <Text>42</Text>
      </SlotShadow>
    );
  });

  return renderer;
};

type GradientProps = {
  readonly colors: readonly string[];
  readonly locations: readonly number[];
};

const getGradient = (renderer: TestRenderer.ReactTestRenderer) =>
  renderer.root.findByType(MaskedView).props
    .maskElement as React.ReactElement<GradientProps>;

describe("SlotShadow", () => {
  test.each([
    ["short hex", "#abc", "rgba(170, 187, 204, 0)"],
    ["short hex with alpha", "#abcd", "rgba(170, 187, 204, 0)"],
    ["rgb", "rgb(12, 34, 56)", "rgba(12, 34, 56, 0)"],
    ["rgba percentages", "rgba(100%, 50%, 0%, 0.5)", "rgba(255, 128, 0, 0)"],
  ])("parses %s colors for the transparent edge", (_label, color, fadeColor) => {
    const gradient = getGradient(renderShadow({ color }));

    expect(gradient.type).toBe(LinearGradient);
    expect(gradient.props.colors[0]).toBe(fadeColor);
  });

  test.each(["#ggg", "rgb(foo)", "hsl(1, 2%, 3%)", "blue"])(
    "uses a light transparent fallback for unsupported color %s",
    (color) => {
      const gradient = getGradient(renderShadow({ color }));

      expect(gradient.props.colors[0]).toBe("rgba(255, 255, 255, 0)");
    }
  );

  test("clamps the edge fade to a usable viewport range", () => {
    const minimumGradient = getGradient(
      renderShadow({ size: 2, slotHeight: 20, viewportHeight: 40 })
    );
    const maximumGradient = getGradient(
      renderShadow({ size: 100, slotHeight: 20, viewportHeight: 40 })
    );
    const defaultGradient = getGradient(
      renderShadow({ size: 10, slotHeight: 20, viewportHeight: 40 })
    );

    expect(minimumGradient.props.locations).toEqual([0, 0.1, 0.9, 1]);
    expect(maximumGradient.props.locations).toEqual([0, 0.5, 0.5, 1]);
    expect(defaultGradient.props.locations).toEqual([0, 0.25, 0.75, 1]);
  });
});
