import React from "react";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import TestRenderer, { act } from "react-test-renderer";
import { Laminar } from "../../src";

describe("public Laminar API", () => {
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

  test("API-DT-007 selects keyed leading content from the current text", () => {
    const leading = {
      Loading: <Text>spinner</Text>,
      Success: <Text>check</Text>,
    };
    let renderer!: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <Laminar text="Loading" leading={leading} autoSize={false} />
      );
    });

    expect(
      renderer.root.findAllByType(Text).some((node) => node.props.children === "spinner")
    ).toBe(true);

    act(() => {
      renderer.update(
        <Laminar text="Success" leading={leading} autoSize={false} />
      );
    });

    expect(
      renderer.root.findAllByType(Text).some((node) => node.props.children === "check")
    ).toBe(true);
    expect(
      renderer.root.findAllByType(Text).some((node) => node.props.children === "spinner")
    ).toBe(false);
  });

  test.each(["number", "slots"] as const)(
    "API-DT-008 %s renders and reconciles a leading inline element",
    (variant) => {
      const leading = {
        "$12": <Text>coin</Text>,
        "$13": <Text>updated-coin</Text>,
      };
      let renderer!: TestRenderer.ReactTestRenderer;

      act(() => {
        renderer = TestRenderer.create(
          <Laminar
            text="$12"
            variant={variant}
            leading={leading}
            leadingGap={4}
            autoSize={false}
          />
        );
      });

      expect(
        renderer.root.findAllByType(Text).some((node) => node.props.children === "coin")
      ).toBe(true);

      act(() => {
        renderer.update(
          <Laminar
            text="$13"
            variant={variant}
            leading={leading}
            leadingGap={4}
            autoSize={false}
          />
        );
      });

      expect(
        renderer.root
          .findAllByType(Text)
          .some((node) => node.props.children === "updated-coin")
      ).toBe(true);
      expect(
        renderer.root.findAllByType(Text).some((node) => node.props.children === "coin")
      ).toBe(false);
    }
  );

  test.each(["number", "slots"] as const)(
    "API-DT-009 %s includes leading content in auto-size measurement",
    (variant) => {
      let renderer!: TestRenderer.ReactTestRenderer;

      act(() => {
        renderer = TestRenderer.create(
          <Laminar
            text="42"
            variant={variant}
            leading={<Text>coin</Text>}
            leadingGap={4}
          />
        );
      });

      const measurement = renderer.root
        .findAllByType(View)
        .find((node) => typeof node.props.onLayout === "function");

      expect(
        measurement?.findAllByType(Text).some((node) => node.props.children === "coin")
      ).toBe(true);
    }
  );

  test("API-DT-010 renders top and bottom fades for shadow-enabled slot reels", () => {
    let renderer!: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <Laminar
          text="42"
          variant="slots"
          shadow
          autoSize={false}
        />
      );
    });

    const shadowMasks = renderer.root.findAllByType(MaskedView);
    const maskGradient = shadowMasks[0].props.maskElement;

    expect(shadowMasks).toHaveLength(2);
    expect(maskGradient.type).toBe(LinearGradient);
    expect(maskGradient.props.colors).toEqual([
      "rgba(255, 255, 255, 0)",
      "#ffffff",
      "#ffffff",
      "rgba(255, 255, 255, 0)",
    ]);
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
      .findAllByType(View)
      .find((node) => typeof node.props.onLayout === "function");

    expect(
      measurement?.findAllByType(Text).map((node) => node.props.children).join("")
    ).toBe("A\u00A0B");
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
