import { View, Text } from "react-native";
import { label } from "@bacons/apple-colors";

type ListItem = {
  label: string;
  value: string | number;

};

type ListsProps = {
  title: string;
  items: ListItem[];
};

const Lists = ({ title, items }: ListsProps) => {
  return (
    <View style={{ marginBottom: 32, paddingHorizontal: 16 }}>
      <Text style={{
        fontSize: 20,
        fontWeight: "600",
        color: label,
        marginBottom: 12,
        // paddingLeft: 16, 
      }}>{title}</Text>
      <View style={{
        backgroundColor: "rgba(120,120,128,0.12)",
        borderRadius: 12, 
        overflow: 'hidden',
        paddingHorizontal: 16,
      }}>
        {items.map((item, index) => (
          <View
            key={item.label}
            style={{
              paddingVertical: 10, 
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-between",
              borderBottomWidth: index === items.length - 1 ? 0 : 0.5,
              borderBottomColor: "rgba(120,120,128,0.2)",
            }}
          >

            <Text style={{
              fontSize: 16,
              color: label,
              opacity: 0.8,
              flex: 1,
            }}>{item.label}</Text>
            <Text style={{
              fontSize: 16,
              color: label,
              flex: 2,
              textAlign: 'right', 
            }}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Lists;
 