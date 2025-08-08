import { Pressable, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

export default function Header({
  onPress,
  leftLabel,
  shouldClose,
}: {
  onPress: () => void;
  leftLabel?: React.ReactNode | string;
  shouldClose?: boolean;
}) {
  return (
    <View style={{ gap: 24 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {typeof leftLabel === "string" ? (
          <Text
            style={{
              fontSize: 24,
          
              fontFamily: "OpenRunde-Semibold",
            }}
          >
            {leftLabel}
          </Text>
        ) : (
          leftLabel
        )}

        

        {shouldClose && (
          <Pressable
          style={{
            padding: 4,
            aspectRatio: 1,
            width: 32,
            // backgroundColor: Colors.grey[100],
            borderRadius: 1000,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={onPress}
        >
          <SymbolView
            name="xmark.circle.fill"
            type="palette"
            size={35}

            colors={[ "#94999F", "#F7F7F7",]}
           
          />
        </Pressable>
        )}
        
      </View>
  
    </View>
  );
}