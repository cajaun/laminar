import { Colors } from "./colors";
import { View, Text } from "react-native";
import { Octicons } from "@expo/vector-icons";

export default function Reasons() {
  return (
    <View style={{ gap: 20 }}>
      <ReasonRow
        icon={
          <Octicons name="shield-check" color={Colors.grey[300]} size={24} />
        }
        text="Keep your key safe"
      />
      <ReasonRow
        icon={
          <Octicons name="repo-deleted" color={Colors.grey[300]} size={24} />
        }
        text="Don't share it with anyone else"
      />
      <ReasonRow
        icon={
          <Octicons name="circle-slash" color={Colors.grey[300]} size={24} />
        }
        text="If you lose it, we can't recover it"
      />
    </View>
  );
}

function ReasonRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
      {icon}
      <Text
        style={{
          fontSize: 16,
          color: Colors.grey[300],
          fontFamily: "OpenRunde-Semibold",
        }}
      >
        {text}
      </Text>
    </View>
  );
}
