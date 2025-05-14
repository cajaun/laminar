import { SFSymbol, SymbolView } from "expo-symbols";
import { Text, View } from "react-native";
import { Colors } from "./email-data";
import React from "react";

interface Email {
  id: string;
  sender: string;
  time: string;
  subject: string;
  preview: string;
  icon: SFSymbol;
}

type EmailItemProps = {
  item: Email;
};

const getRandomColor = () =>
  Colors[Math.floor(Math.random() * Colors.length)];

const EmailItem: React.FC<EmailItemProps> = ({ item }) => {
  const randomBgColor = React.useMemo(() => getRandomColor(), []);
  return (
    <View className="flex-row items-start p-3 border-b border-gray-200 bg-white">
    <View className="p-1 rounded-lg mt-2" style={{ backgroundColor: randomBgColor }}>
      <SymbolView name={item.icon} tintColor={"white"} />
    </View>
  
    <View className="flex-1 ml-3">
      <View className="flex-row justify-between items-center">
        <Text className="font-bold text-gray-800 text-lg">{item.sender}</Text>
        <Text className="text-sm text-gray-500 font-medium">{item.time}</Text>
      </View>
      <Text className="text-sm text-gray-800 font-medium">{item.subject}</Text>
      <Text className="text-sm text-gray-500 font-medium">{item.preview}</Text>
    </View>
  </View>
  
  );
};

export default EmailItem