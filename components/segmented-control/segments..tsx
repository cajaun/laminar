import { View, Text } from "react-native";
import React, { useState } from "react";
import { SegmentedControl } from "./segmented-control";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const SegmentedTabs = () => {
  const { top } = useSafeAreaInsets();

  const tabGroups = [
    {
      id: "group1",
      tabs: [
        { key: "a", label: "A" },
        { key: "b", label: "B" },
      ],
    },
    {
      id: "group2",
      tabs: [
        { key: "x", label: "X" },
        { key: "y", label: "Y" },
        { key: "z", label: "Z" },
      ],
    },
    {
      id: "group3",
      tabs: [
        { key: "1", label: "One" },
        { key: "2", label: "Two" },
        { key: "3", label: "Three" },
        { key: "4", label: "Four" },
      ],
    },
  ];

  const [activeIndices, setActiveIndices] = useState(
    tabGroups.map(() => 0)
  );

  const handleSetActiveIndex = (groupIndex: number, index: number) => {
    const updated = [...activeIndices];
    updated[groupIndex] = index;
    setActiveIndices(updated);
  };

  return (
    <SafeAreaView className="flex-1 px-4 gap-y-6" style={{ paddingTop: top }}>
      {tabGroups.map((group, idx) => (
        <SegmentedControl
          key={group.id}
          tabs={group.tabs}
          activeIndex={activeIndices[idx]}
          setActiveIndex={(index) => handleSetActiveIndex(idx, index)}
        />
      ))}
    </SafeAreaView>
  );
};

export default SegmentedTabs;
