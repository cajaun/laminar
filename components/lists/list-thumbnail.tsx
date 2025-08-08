import { View, Text, Pressable, FlatList, Image } from "react-native";
import { label } from "@bacons/apple-colors";
import { SFSymbol, SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ListItem = {
  label: string;
  value: string | number | Array<string | number> | null | undefined;
  thumbnail: { uri: string } | string | React.ReactNode;
  onPress?: () => void;
  switch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
};

type ListsProps = {
  title?: string;
  items: ListItem[];
  footer?: string;
  onItemPress?: (item: ListItem) => void;
  showValue?: boolean;
  padding?: boolean;
  tintColor?: string;
};

const ListThumbnail = ({
  title,
  footer,
  items,
  onItemPress,
  showValue = true,
  padding = false,
  tintColor,
}: ListsProps) => {
  const { bottom } = useSafeAreaInsets();

  const textColor = tintColor || "#979595";
  const labelColor = tintColor || label;

  return (
    <View style={{ marginBottom: padding ? bottom : 16 }}>
      {title && (
        <Text
          className="font-normal "
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
                marginLeft: 49,
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
              style={{
                paddingVertical: 5,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 3,
                  gap: 14,
                 
                }}
              >
                <View className="flex-row justify-center items-center gap-x-4">
                  {item.thumbnail != null ? (
                    typeof item.thumbnail === "string" ||
                    (typeof item.thumbnail === "object" &&
                      "uri" in item.thumbnail) ? (
                      <Image
                        source={
                          typeof item.thumbnail === "string"
                            ? { uri: item.thumbnail }
                            : item.thumbnail
                        }
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                        }}
                      />
                    ) : (
                      <>{item.thumbnail}</>
                    )
                  ) : null}

                  <View style={{ flexDirection: "column" }}>
                    {Array.isArray(item.value) ? (
                      item.value.map((val, index) => (
                        <Text
                          key={index}
                          style={{
                            fontSize: index === 0 ? 14 : 12,
                            color: index === 0 ? labelColor : "#3C3C4399",
                            opacity: 0.8,
                          }}
                        >
                          {val}
                        </Text>
                      ))
                    ) : (
                      <Text
                        style={{
                          fontSize: 14,
                          color: labelColor,
                          opacity: 0.8,
                        }}
                      >
                        {item.value}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {showValue && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    flex: 2,
                    gap: 4,
                  }}
                >
                  <SymbolView
                    name="chevron.right"
                    size={12}
                    tintColor={textColor}
                    weight="semibold"
                  />
                </View>
              )}
            </Pressable>
          )}
        />
      </View>
      {footer && (
        <Text
          className="font-normal text-[#3C3C4399]"
          style={{
            paddingHorizontal: 18,
            fontSize: 11,
            marginTop: 8,
          }}
        >
          {footer}
        </Text>
      )}
    </View>
  );
};

export default ListThumbnail;
