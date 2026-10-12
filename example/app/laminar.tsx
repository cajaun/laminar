import { useWindowDimensions } from "react-native";
import { MorphDemoScreen } from "@/components/morph-demo";

export default function LaminarRoute() {
  const { width, height } = useWindowDimensions();

  return <MorphDemoScreen width={width} height={height} />;
}
