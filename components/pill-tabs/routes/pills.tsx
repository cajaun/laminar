import { View, Text } from "react-native";
import React, { useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { SFSymbol } from "expo-symbols";
import { pillTabsStyles } from "@/components/pill-tabs/pill-tabs-styles";
import PillTabs from "@/components/pill-tabs/pill-tabs";

interface Tabs {
  id: string;
  title: string;
}
const tabs: Tabs[] = [
  { id: "top results", title: "Top Results" },
  { id: "shows", title: "Shows" },
  { id: "episodes", title: "Episodes" },
  { id: "channels", title: "Channels" },
];
const PillTab = () => {
  const [activeTab, setActiveTab] = useState("top results");
  const { top } = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ paddingTop: top }}>
      <PillTabs
        tabs={tabs}
        onChangeTab={setActiveTab}
        activeTab={activeTab}
        pillTabContainerStyle={pillTabsStyles.tabBarContainerStyle}
        tabStyle={[pillTabsStyles.tabStyle]}
        indicatorStyle={[pillTabsStyles.indicatorStyle]}
      />
    </SafeAreaView>
  );
};

export default PillTab;
