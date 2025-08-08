import { BlurView } from "expo-blur";
import TouchableBounce from "./touchable-bounce";

export function ProminentHeaderButton({
  children,
  ...props
}: {
  children?: React.ReactNode;
}) {
  return (
    <TouchableBounce sensory onPress={() => {}} {...props}>
      <BlurView
        tint="prominent"
        intensity={80}
        style={{
          borderRadius: 999,
          padding: 8,

          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          overflow: "hidden",
          aspectRatio: 1,
        }}
      >
        {children}
      </BlurView>
    </TouchableBounce>
  );
}