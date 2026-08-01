import React from "react";
import { Text } from "react-native";
import TestRenderer, { act } from "react-test-renderer";
import type { MotionRecipe } from "../../src/types";
import { NumberLane } from "../../src/view/number-lane";

const transition = jest.fn(() => ({
  initialValues: {},
  animations: {},
}));
const motionRecipe: MotionRecipe = {
  durationMs: 100,
  easing: ((value: number) => value) as never,
  layoutTransition: {} as never,
  enterTransition: transition,
  exitTransition: transition,
  driveNumber: (value) => value,
};

const renderLane = (
  props: Partial<React.ComponentProps<typeof NumberLane>> = {}
) => {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(
      <NumberLane
        unit="5"
        tokenKey={1}
        isLead={false}
        hasAnimated
        delayMs={0}
        direction={1}
        travelDistance={10}
        motionRecipe={motionRecipe}
        {...props}
      />
    );
  });
  return renderer;
};

describe("NumberLane", () => {
  test("NLA-DT-001 lead content renders as plain text without animation shell", () => {
    const renderer = renderLane({ unit: "$", isLead: true });

    expect(renderer.root.findAllByType(Text)).toHaveLength(1);
    expect(renderer.root.findByType(Text).props.children).toBe("$");
  });

  test.each([
    ["NLA-EP-001 digit", "5", 2],
    ["NLA-EP-002 punctuation", ",", 2],
  ])("%s keeps a hidden layout owner and visible token", (_id, unit, count) => {
    const renderer = renderLane({ unit });
    const texts = renderer.root.findAllByType(Text);

    expect(texts).toHaveLength(count);
    expect(texts.map((text) => text.props.children)).toEqual([unit, unit]);
  });

  test.each([
    ["NLA-DT-002 increasing", 1],
    ["NLA-DT-003 stationary", 0],
    ["NLA-DT-004 decreasing", -1],
  ] as const)("%s creates valid transition functions", (_id, direction) => {
    const renderer = renderLane({ direction });
    const animatedToken = renderer.root.findAllByType(Text)[1];

    expect(typeof animatedToken.props.entering).toBe("function");
    expect(typeof animatedToken.props.exiting).toBe("function");
  });

  test("NLA-ST-001 first paint can suppress entering animation", () => {
    const renderer = renderLane({ hasAnimated: false });
    const animatedToken = renderer.root.findAllByType(Text)[1];

    expect(animatedToken.props.entering).toBeUndefined();
    expect(animatedToken.props.layout).toBeUndefined();
  });
});
