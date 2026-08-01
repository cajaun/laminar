import React from "react";
import { Text } from "react-native";
import TestRenderer, { act } from "react-test-renderer";
import LaminarDefault, {
  Laminar,
  MorphingText,
} from "../../src";

describe("public Laminar API", () => {
  test("API-REG-001 default and compatibility exports share one component", () => {
    expect(LaminarDefault).toBe(Laminar);
    expect(MorphingText).toBe(Laminar);
  });

  test.each([
    ["API-DT-001 text", "text"],
    ["API-DT-002 number", "number"],
    ["API-DT-003 slots", "slots"],
  ] as const)("%s renders every public variant", (_id, variant) => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <Laminar text="$12" variant={variant} autoSize={false} />
      );
    });

    expect(renderer.root.findAllByType(Text).length).toBeGreaterThan(0);
  });

  test("API-DT-006 reconciles a leading inline element with text updates", () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <Laminar
          text="Confirm"
          leading={<Text>icon</Text>}
          autoSize={false}
        />
      );
    });

    expect(
      renderer.root.findAllByType(Text).some((node) => node.props.children === "icon")
    ).toBe(true);

    act(() => {
      renderer.update(<Laminar text="Confirm Slippage" autoSize={false} />);
    });

    expect(
      renderer.root.findAllByType(Text).some((node) => node.props.children === "icon")
    ).toBe(false);
  });

  test("API-EP-001 coerces number and nullish runtime inputs without throwing", () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    expect(() => {
      act(() => {
        renderer = TestRenderer.create(<Laminar text={42} />);
      });
    }).not.toThrow();
    expect(renderer.root.findAllByType(Text).some((node) => node.props.children === "4")).toBe(true);

    expect(() => {
      act(() => {
        renderer.update(<Laminar text={null as never} />);
      });
    }).not.toThrow();
  });

  test("API-DT-004 auto-size measurement normalizes spaces and receives layout handler", () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<Laminar text="A B" />);
    });
    const measurement = renderer.root
      .findAllByType(Text)
      .find((node) => typeof node.props.onLayout === "function");

    expect(measurement?.props.children).toBe("A\u00A0B");
  });

  test("API-DT-005 disabled auto-size does not render a measurement node", () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<Laminar text="ABC" autoSize={false} />);
    });

    expect(
      renderer.root
        .findAllByType(Text)
        .some((node) => typeof node.props.onLayout === "function")
    ).toBe(false);
  });

});
