import { View, Text, ScrollView, ViewProps } from "react-native";
import React, { useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { SFSymbol } from "expo-symbols";
import { pillTabsStyles } from "@/components/pill-tabs/pill-tabs-styles";
import PillTabs from "@/components/pill-tabs/pill-tabs";
import {
  Body,
  Callout,
  Caption,
  Caption2,
  Footnote,
  Headline,
  LargeTitle,
  Subheadline,
  Title,
  Title2,
  Title3,
} from "@/components/ui/title";
import * as AC from "@bacons/apple-colors";
import { HeaderButton } from "@/components/ui/utils/header";

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

export function Rounded({
  rounded,
  padding,
  capsule,
  ...props
}: ViewProps & {
  padding?: number | boolean;
  rounded?: boolean;
  capsule?: boolean;
}) {
  const paddingStyle =
    padding === true ? { padding: 16 } : padding ? { padding } : {};
  return (
    <View
      {...props}
      style={[
        paddingStyle,
        {
          borderCurve: "continuous",
          borderRadius: 10,
        },
        capsule && {
          borderCurve: "circular",
          borderRadius: 9999,
        },
        props.style,
      ]}
    />
  );
}

const PillTab = () => {
  const [activeTab, setActiveTab] = useState("top results");
  const { top } = useSafeAreaInsets();

  return (
    <ScrollView style={{ paddingTop: top }} className = "gap-y-4">

<Rounded
          rounded
          style={{
            margin: 16,
            gap: 8,
            backgroundColor: AC.secondarySystemGroupedBackground,
          }}
        >
<LargeTitle >LargeTitle</LargeTitle>
          <Title>Title 1</Title>
          <Title2>Title 2</Title2>
          <Title3>Title 3</Title3>
          <Headline>Headline</Headline>
          <Subheadline>Subheadline</Subheadline>
          <Body>Body</Body>
          <Callout>Callout</Callout>
          <Footnote>Footnote</Footnote>
          <Caption>Caption 1</Caption>
          <Caption2>Caption 2</Caption2>
          {/* Example with rounded font */}
          <Title rounded>Rounded Title 1</Title>
          <Title >Rounded Title 1</Title>
          {/* Example with monospaced font */}
     
          </Rounded>

          <HeaderButton
          pressOpacity={0.7}
          style={{
            backgroundColor: "red",
            // Offset on the side so the margins line up. Unclear how to handle when this is used in headerLeft.
            // We should automatically detect it somehow.
            marginRight: -8,
          }}
        >
         <Body monospaced>Monospaced Body</Body>
        </HeaderButton>

      {/* <PillTabs
        tabs={tabs}
        onChangeTab={setActiveTab}
        activeTab={activeTab}
        pillTabContainerStyle={pillTabsStyles.tabBarContainerStyle}
        tabStyle={[pillTabsStyles.tabStyle]}
        indicatorStyle={[pillTabsStyles.indicatorStyle]}
      /> */}
    </ScrollView>
  );
};

export default PillTab;
