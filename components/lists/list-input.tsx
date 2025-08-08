import React from "react";
import { FlatList, TextInput, Text, View } from "react-native";


type InputField = {
  key: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  inputRef?: React.RefObject<TextInput>;
  maxLength?: number;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
};

type ListInputProps = {
  inputs: InputField[];
  title?: string;
  footer?: string;
  tintColor?: string;
};

const ListInput = ({ inputs, title, footer, tintColor}: ListInputProps) => {

  const textColor = tintColor || "#979595";
  const labelColor = tintColor || "#000";

  return (
    <View style={{ marginBottom: 16 }}>
      {title && (
        <Text
          className="font-normal text-[#89898F]"
          style={{
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
          data={inputs}
          ItemSeparatorComponent={() => (
            <View
            className="border-b-[0.25px]"
            style={{
              borderBottomColor: "#C6C6C6",
              marginLeft:  17,
              height: 0.5,
            }}
          />
          )}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 18,
                height: 43,
              }}
            >
              {item.label ? (
                <>
                  <Text
                    style={{
                       flex: 1,
                      fontSize: 14,
                      color: labelColor,
                      opacity: 0.8,
                    }}
                  >
                    {item.label}
                  </Text>
          
                  <TextInput
                    ref={item.inputRef}
                    style={{
                      flex: 1.5,
                      fontSize: 14,
                      color: "#000",
                      paddingHorizontal: 8,
                    }}
                    placeholder={item.placeholder}
                    placeholderTextColor="#979595"
                    selectionColor="#000"
                    value={item.value}
                    onChangeText={item.onChangeText}
                    maxLength={item.maxLength}
                    keyboardType={item.keyboardType || "default"}
                  />
                </>
              ) : (
              
                <TextInput
                  ref={item.inputRef}
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: "#000",
                   
                  }}
                  placeholder={item.placeholder}
                  placeholderTextColor="#979595"
                  selectionColor="#000"
                  value={item.value}
                  onChangeText={item.onChangeText}
                  maxLength={item.maxLength}
                  keyboardType={item.keyboardType || "default"}
                />
              )}
            </View>
          )}
          keyExtractor={(item) => item.key}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
         
        />
      </View>
      {footer && (
        <Text
          className="font-normal text-[#89898F]"
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

export default ListInput;

