import SegmentedControl from "@react-native-segmented-control/segmented-control";

import React, {
  Children,
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";
import { StyleProp, ViewStyle } from "react-native";

/* ----------------------------------------------------------------------------------
 * Context
 * ----------------------------------------------------------------------------------*/

interface SegmentsContextValue {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

const SegmentsContext = createContext<SegmentsContextValue | undefined>(
  undefined
);

/* ----------------------------------------------------------------------------------
 * Segments (Container)
 * ----------------------------------------------------------------------------------*/

interface SegmentsProps {
  /** The initial value for the controlled Segments */
  defaultValue: string;

  /** The children of the Segments component (SegmentsList, SegmentsContent, etc.) */
  children: ReactNode;
}

export function Segments({ defaultValue, children }: SegmentsProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <SegmentsContext.Provider value={{ value, setValue }}>
      {children}
    </SegmentsContext.Provider>
  );
}

export function SegmentsList({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const context = useContext(SegmentsContext);
  if (!context) {
    throw new Error("SegmentsList must be used within a Segments");
  }

  const { value, setValue } = context;

  const triggers = Children.toArray(children).filter(
    (child: any) =>
      React.isValidElement(child) && child.type === SegmentsTrigger
  );

  const labels = triggers.map((trigger: any) => trigger.props.children);
  const values = triggers.map((trigger: any) => trigger.props.value);

  const handleChange = (event: any) => {
    const index = event.nativeEvent.selectedSegmentIndex;
    setValue(values[index]);
  };

  return (
    <SegmentedControl
      values={labels}
      style={style}
      selectedIndex={values.indexOf(value)}
      onChange={handleChange}
    />
  );
}
/* ----------------------------------------------------------------------------------
 * SegmentsTrigger
 * ----------------------------------------------------------------------------------*/

interface SegmentsTriggerProps {
  /** The value that this trigger represents */
  value: string;
  /** The label to display for this trigger in the SegmentedControl */
  children: ReactNode;
}

export function SegmentsTrigger(_: SegmentsTriggerProps) {
  // We don't actually render anything here. This component serves as a "marker"
  // for the SegmentsList to know about possible segments.
  return null;
}

SegmentsTrigger.displayName = "SegmentsTrigger";
/* ----------------------------------------------------------------------------------
 * SegmentsContent
 * ----------------------------------------------------------------------------------*/

interface SegmentsContentProps {
  /** The value from the matching SegmentsTrigger */
  value: string;
  /** The content to be rendered when the active value matches */
  children: ReactNode;
}

export function SegmentsContent({ value, children }: SegmentsContentProps) {
  const context = useContext(SegmentsContext);
  if (!context) {
    throw new Error("SegmentsContent must be used within a Segments");
  }

  const { value: currentValue } = context;
  if (currentValue !== value) {
    return null;
  }

  return <>{children}</>;
}

Segments.List = SegmentsList;
Segments.Trigger = SegmentsTrigger;
Segments.Content = SegmentsContent;
