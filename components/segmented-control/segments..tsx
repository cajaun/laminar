import React, { useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, StyleSheet } from "react-native";
import { Segments } from "./segmented-control";


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

  const initialValues = tabGroups.map((group) => group.tabs[0].key);
  const [activeValues, setActiveValues] = useState(initialValues);

  const handleSetActiveValue = (groupIndex: number, value: string) => {
    const updated = [...activeValues];
    updated[groupIndex] = value;
    setActiveValues(updated);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: top }]}>



      {tabGroups.map((group, idx) => (
        <Segments
          key={group.id}
          defaultValue={group.tabs[0].key} 
        >
       
          <Segments.List>
            {group.tabs.map((tab) => (
              <Segments.Trigger key={tab.key} value={tab.key}>
                {tab.label}
              </Segments.Trigger>
            ))}
          </Segments.List>

     
          {group.tabs.map((tab) => (
            <Segments.Content key={tab.key} value={tab.key}>
              <View style={styles.content}>
                <Text style={styles.contentText}>
                  You selected "{tab.label}" from group {group.id}.
                </Text>
              </View>
            </Segments.Content>
          ))}
        </Segments>
      ))}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 24,
    backgroundColor: "#fff",
  },
  content: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#e0f7fa",
    borderRadius: 8,
  },
  contentText: {
    fontSize: 16,
    color: "#00796b",
  },
});

export default SegmentedTabs;
