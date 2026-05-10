import { useWindowDimensions } from "react-native";
import { MorphDemoScreen } from "@/components/morph-demo";

export default function Index() {
  const { width, height } = useWindowDimensions();

  return <MorphDemoScreen width={width} height={height} />;
}
