import { act } from "react-test-renderer";
import { useInlineAutoWidth } from "../../src/hooks/use-inline-auto-width";
import { renderHook } from "../support/render-hook";

const layoutEvent = (width: number) =>
  ({
    nativeEvent: {
      layout: { width, height: 10, x: 0, y: 0 },
    },
  }) as never;

describe("useInlineAutoWidth", () => {
  test("HAW-ST-001 snaps first width and animates subsequent distinct widths", () => {
    const driveToWidth = jest.fn((value: number) => value + 0.5);
    const hook = renderHook(
      ({
        enabled,
        measurementKey,
      }: {
        enabled: boolean;
        measurementKey: string;
      }) =>
        useInlineAutoWidth({ enabled, driveToWidth, measurementKey }),
      { enabled: true, measurementKey: "A" }
    );

    expect(hook.result.animatedWidthStyle).toEqual({});

    act(() => hook.result.captureVisibleLayout(layoutEvent(20.1)));
    hook.rerender({ enabled: true, measurementKey: "A" });
    expect(hook.result.animatedWidthStyle).toEqual({ width: 20.1 });
    expect(driveToWidth).not.toHaveBeenCalled();
    act(() => hook.result.captureLayout(layoutEvent(35.2)));
    expect(driveToWidth).not.toHaveBeenCalled();

    hook.rerender({ enabled: true, measurementKey: "B" });
    expect(hook.result.isReady).toBe(false);
    act(() => hook.result.captureLayout(layoutEvent(30.2)));
    expect(hook.result.isReady).toBe(true);
    expect(driveToWidth).toHaveBeenCalledWith(31);
    hook.rerender({ enabled: true, measurementKey: "B" });
    expect(hook.result.animatedWidthStyle).toEqual({ width: 31.5 });

    hook.rerender({ enabled: true, measurementKey: "A" });
    expect(hook.result.shouldMeasure).toBe(false);
    expect(driveToWidth).toHaveBeenCalledWith(20.1);
  });

  test("HAW-BVA-001 clamps negative width and rounds fractional boundaries up", () => {
    const driveToWidth = jest.fn((value: number) => value);
    const hook = renderHook(
      ({ measurementKey }: { measurementKey: string }) =>
        useInlineAutoWidth({
          enabled: true,
          driveToWidth,
          measurementKey,
        }),
      { measurementKey: "boundary" }
    );

    act(() => hook.result.captureVisibleLayout(layoutEvent(-0.1)));
    hook.rerender({ measurementKey: "boundary" });
    expect(hook.result.animatedWidthStyle).toEqual({ width: 0 });
    hook.rerender({ measurementKey: "next" });
    act(() => hook.result.captureLayout(layoutEvent(0.01)));
    expect(driveToWidth).toHaveBeenCalledWith(1);
  });

  test("HAW-ST-003 keeps a probe-before-visible callback from bootstrapping the frame", () => {
    const driveToWidth = jest.fn((value: number) => value + 0.5);
    const hook = renderHook(
      () =>
        useInlineAutoWidth({
          enabled: true,
          driveToWidth,
          measurementKey: "initial",
        }),
      undefined
    );

    act(() => hook.result.captureLayout(layoutEvent(35.2)));
    expect(hook.result.animatedWidthStyle).toEqual({});
    expect(driveToWidth).not.toHaveBeenCalled();

    act(() => hook.result.captureVisibleLayout(layoutEvent(30.1)));
    hook.rerender(undefined);
    expect(hook.result.animatedWidthStyle).toEqual({ width: 30.1 });
    expect(driveToWidth).not.toHaveBeenCalled();
  });

  test("HAW-ST-004 ignores an initial probe that arrives after visible bootstrap", () => {
    const driveToWidth = jest.fn((value: number) => value + 0.5);
    const hook = renderHook(
      () =>
        useInlineAutoWidth({
          enabled: true,
          driveToWidth,
          measurementKey: "initial",
        }),
      undefined
    );

    act(() => hook.result.captureVisibleLayout(layoutEvent(30.1)));
    act(() => hook.result.captureLayout(layoutEvent(35.2)));
    hook.rerender(undefined);

    expect(hook.result.animatedWidthStyle).toEqual({ width: 30.1 });
    expect(driveToWidth).not.toHaveBeenCalled();
  });

  test("HAW-ST-006 bridges a probe for the old key into visible layout for the new key", () => {
    const driveToWidth = jest.fn((value: number) => value + 0.5);
    const hook = renderHook(
      ({ measurementKey }: { measurementKey: string }) =>
        useInlineAutoWidth({
          enabled: true,
          driveToWidth,
          measurementKey,
        }),
      { measurementKey: "A" }
    );

    act(() => hook.result.captureLayout(layoutEvent(20.2)));
    hook.rerender({ measurementKey: "B" });
    act(() => hook.result.captureVisibleLayout(layoutEvent(30.1)));
    hook.rerender({ measurementKey: "B" });

    expect(driveToWidth).toHaveBeenCalledWith(30.1);
    expect(hook.result.animatedWidthStyle).toEqual({ width: 30.6 });
  });

  test("HAW-ST-005 cold-start probe fallback preserves a pending first morph", () => {
    jest.useFakeTimers();

    try {
      const driveToWidth = jest.fn((value: number) => value + 0.5);
      const hook = renderHook(
        ({ measurementKey }: { measurementKey: string }) =>
          useInlineAutoWidth({
            enabled: true,
            driveToWidth,
            measurementKey,
          }),
        { measurementKey: "A" }
      );

      act(() => hook.result.captureLayout(layoutEvent(20.2)));
      hook.rerender({ measurementKey: "B" });
      act(() => hook.result.captureLayout(layoutEvent(30.2)));
      act(() => jest.runOnlyPendingTimers());
      hook.rerender({ measurementKey: "B" });

      expect(driveToWidth).toHaveBeenCalledWith(31);
      expect(hook.result.animatedWidthStyle).toEqual({ width: 31.5 });
    } finally {
      jest.useRealTimers();
    }
  });

  test("HAW-DT-001 ignores disabled and duplicate measurements", () => {
    const driveToWidth = jest.fn((value: number) => value);
    const hook = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useInlineAutoWidth({
          enabled,
          driveToWidth,
          measurementKey: "duplicate",
        }),
      { enabled: false }
    );

    act(() => hook.result.captureVisibleLayout(layoutEvent(10)));
    act(() => hook.result.captureLayout(layoutEvent(10)));
    expect(hook.result.animatedWidthStyle).toEqual({});

    hook.rerender({ enabled: true });
    act(() => hook.result.captureVisibleLayout(layoutEvent(10)));
    act(() => hook.result.captureVisibleLayout(layoutEvent(10)));
    hook.rerender({ enabled: true });
    expect(hook.result.animatedWidthStyle).toEqual({ width: 10 });
    expect(driveToWidth).not.toHaveBeenCalled();

    hook.rerender({ enabled: false });
    expect(hook.result.animatedWidthStyle).toEqual({});
  });

  test("HAW-ST-002 evicts the least recently used width after promoting a hit", () => {
    const driveToWidth = jest.fn((value: number) => value);
    const hook = renderHook(
      ({ measurementKey }: { measurementKey: string }) =>
        useInlineAutoWidth({
          enabled: true,
          driveToWidth,
          measurementKey,
        }),
      { measurementKey: "key-0" }
    );

    act(() => hook.result.captureVisibleLayout(layoutEvent(10)));

    for (let index = 1; index <= 64; index += 1) {
      hook.rerender({ measurementKey: `key-${index}` });
      act(() => hook.result.captureLayout(layoutEvent(index + 10)));
    }

    hook.rerender({ measurementKey: "key-1" });
    expect(hook.result.shouldMeasure).toBe(false);

    hook.rerender({ measurementKey: "key-65" });
    act(() => hook.result.captureLayout(layoutEvent(75)));

    hook.rerender({ measurementKey: "key-2" });
    expect(hook.result.shouldMeasure).toBe(true);
  });

  test("HAW-ST-007 clears a pending cold-start bootstrap on unmount", () => {
    jest.useFakeTimers();

    try {
      const driveToWidth = jest.fn((value: number) => value);
      const hook = renderHook(
        () =>
          useInlineAutoWidth({
            enabled: true,
            driveToWidth,
            measurementKey: "initial",
          }),
        undefined
      );

      act(() => hook.result.captureLayout(layoutEvent(20.2)));
      hook.unmount();
      act(() => jest.runOnlyPendingTimers());

      expect(driveToWidth).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});
