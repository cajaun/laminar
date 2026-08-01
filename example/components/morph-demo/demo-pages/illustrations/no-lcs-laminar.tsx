import React from "react";
import { Laminar } from "react-native-laminar";

export function NoLcsLaminar(props: React.ComponentProps<typeof Laminar>) {
  return <Laminar key={String(props.text)} {...props} />;
}
