import { useMorphMotion } from "../../src/hooks/use-morph-motion";
import type {
  MorphAnimationPresetName,
  MorphContentVariant,
} from "../../src/types";
import { renderHook } from "../support/render-hook";

type Props = {
  variant: MorphContentVariant;
  numberMode?: "morph" | "ticker";
  animationPreset?: MorphAnimationPresetName;
  animationDuration?: number;
};

describe("useMorphMotion", () => {
  test.each([
    ["HMM-DT-001 text default", "text", undefined, 380],
    ["HMM-DT-002 number default", "number", undefined, 350],
    ["HMM-DT-003 slots default", "slots", undefined, 350],
    ["HMM-DT-004 explicit override", "number", "smooth", 400],
  ] as const)(
    "%s selects the expected preset",
    (_id, variant, animationPreset, expectedDuration) => {
      const hook = renderHook(
        (props: Props) => useMorphMotion(props),
        { variant, animationPreset }
      );

      expect(hook.result.motionRecipe.durationMs).toBe(expectedDuration);
    }
  );

  test("HMM-DT-005 ticker mode selects the reference timing", () => {
    const hook = renderHook(
      (props: Props) => useMorphMotion({ ...props, numberMode: "ticker" }),
      { variant: "number" }
    );

    expect(hook.result.motionRecipe.durationMs).toBe(300);
  });

  test("HMM-ST-001 updates duration when override changes", () => {
    const hook = renderHook(
      (props: Props) => useMorphMotion(props),
      { variant: "text", animationDuration: 100 }
    );
    const firstRecipe = hook.result.motionRecipe;

    hook.rerender({
      variant: "text",
      animationDuration: 200,
    });

    expect(hook.result.motionRecipe.durationMs).toBe(200);
    expect(hook.result.motionRecipe).not.toBe(firstRecipe);
  });
});
