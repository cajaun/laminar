import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { DataSourceOption } from "@/components/morphing-chart/data/chart-data";

const OPTIONS: DataSourceOption[] = ["Revenue", "Downloads", "MRR"];

type DataSourceMenuProps = {
  value: DataSourceOption;
  onChange: (value: DataSourceOption) => void;
};

export default function DataSourceMenu({
  value,
  onChange,
}: DataSourceMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const choose = (nextValue: DataSourceOption) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        className="min-h-10.5 flex-row items-center self-center gap-2 rounded-full bg-[#F2F5F8] px-3.5"
        style={({ pressed }) => (pressed ? { opacity: 0.72 } : undefined)}
        onPress={() => setIsOpen(true)}
      >
        <View className="h-2 w-2 rounded-full bg-[#32C5FF]" />
        <Text className="font-sf-semibold text-[15px] text-[#22262E]">
          {value}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#68707D" />
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 items-center justify-start bg-[rgba(14,20,30,0.18)] pt-26.25"
          onPress={() => setIsOpen(false)}
        >
          <View className="w-55 rounded-[18px] bg-white p-2 shadow-lg">
            <Text className="px-3 pb-1.25 pt-1.75 font-sf-semibold text-[12px] uppercase tracking-[0.4px] text-[#9AA1AC]">
              Data source
            </Text>
            {OPTIONS.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="menuitem"
                className="min-h-10.5 flex-row items-center justify-between rounded-xl px-3"
                style={({ pressed }) =>
                  pressed ? { backgroundColor: "#F2F5F8" } : undefined
                }
                onPress={() => choose(option)}
              >
                <Text
                  className={`font-sf-medium text-[16px] ${option === value ? "text-[#111318]" : "text-[#3D434D]"}`}
                >
                  {option}
                </Text>
                {option === value ? (
                  <Ionicons name="checkmark" size={18} color="#32C5FF" />
                ) : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
