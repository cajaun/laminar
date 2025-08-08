import { View, Text, Pressable, FlatList, Switch } from "react-native";
import { label } from "@bacons/apple-colors";
import { SFSymbol, SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ListItem = {
  label: string;
  value: string | number | Array<string | number> | null | undefined;
  icon?: SFSymbol;
  onPress?: () => void;
  switch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
};

type ListProps = {
  title?: string;
  items: ListItem[];
  onItemPress?: (item: ListItem) => void;
  showValue?: boolean;
  padding?: boolean;
  tintColor?: string;
};

const List = ({
  title,
  items,
  onItemPress,
  showValue = true,
  padding = false,
  tintColor,
}: ListProps) => {
  const { bottom } = useSafeAreaInsets();
  const hasIcon = items.some((item) => !!item.icon);

  const textColor = tintColor || "#979595";
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
        <FlatList
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          data={items}
          keyExtractor={(item) => item.label}
          ItemSeparatorComponent={() => (
            <View
              className="border-b-[0.25px]"
              style={{
                borderBottomColor: "#C6C6C6",
                marginLeft: hasIcon ? 49 : 17,
                height: 0.5,
              }}
            />
          )}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                if (item.onPress) {
                  item.onPress();
                } else {
                  onItemPress?.(item);
                }
              }}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "red" : "transparent",
                
              })}
            >
               <View
    style={{
      paddingVertical: 10,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      height: 43,
    }}
  >
              <View
                style={{
                  flexDirection: "row", 
                  alignItems: "center",
                  flex: 3,
                  gap: 10,
                  paddingHorizontal: !item.icon ? 0 : 4,
                  paddingVertical: 1,
                }}
              >
                {item.icon && (
                  <SymbolView
                    name={item.icon}
                    size={20}
                    tintColor={tintColor || "#333"}
                  />
                )}
                <Text
                  style={{
                    fontSize: 14,
                    color: labelColor,
                    opacity: 0.8,
                  }}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </View>

              {item.switch ? (
                <Switch
                  value={item.switchValue || false}
                  onValueChange={(val) => item.onSwitchChange?.(val)}
                  trackColor={{ false: "#D1D5DB", true: "#22C55E" }}
                  thumbColor="#fff"
                  style={{
                    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
                  }}
                />
              ) : (
                showValue && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      flex: 2,
                      gap: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: textColor,
                        opacity: 0.8,
                      }}
                    >
                      {item.value}
                    </Text>

                    <SymbolView
                      name="chevron.right"
                      size={12}
                      tintColor={textColor}
                      weight="semibold"
                    />
                  </View>
                )
              )}
              </View>
            </Pressable>
          )}
        />
      </View>
    </View>
  );
};

export default List;
