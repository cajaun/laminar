import { View, Text, Pressable, FlatList } from "react-native";
import { label } from "@bacons/apple-colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ListsProps = {
  title?: string;
  renderContent: () => React.ReactNode;
  padding?: boolean;
  tintColor?: string;
};

const ListContainer = ({ title, renderContent, padding = false, tintColor }: ListsProps) => {
  const { bottom } = useSafeAreaInsets();
  const labelColor = tintColor || label;

  return (
    <View style={{ marginBottom: padding ? bottom : 16 }}>
      {title && (
        <Text
          className="font-normal"
          style={{
            color: "#3C3C4399",
            paddingHorizontal: 18,
            fontSize: 12,
            marginBottom: 8,
          }}
        >
          {title.toUpperCase()}
        </Text>
      )}
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <View  style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
               
              }}>

     
        {renderContent()}
        </View>
      </View>
    </View>
  );
};

export default ListContainer;
