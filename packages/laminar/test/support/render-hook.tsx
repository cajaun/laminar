import React from "react";
import TestRenderer, { act } from "react-test-renderer";

export const renderHook = <TProps, TResult>(
  callback: (props: TProps) => TResult,
  initialProps: TProps
) => {
  let current: TResult;

  const Harness = ({ hookProps }: { hookProps: TProps }) => {
    current = callback(hookProps);
    return null;
  };

  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(<Harness hookProps={initialProps} />);
  });

  return {
    get result() {
      return current!;
    },
    rerender(nextProps: TProps) {
      act(() => {
        renderer.update(<Harness hookProps={nextProps} />);
      });
    },
    unmount() {
      act(() => {
        renderer.unmount();
      });
    },
  };
};
