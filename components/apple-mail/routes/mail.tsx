import React, { useState } from "react";
import { FlatList, ScrollView, Text, View } from "react-native";
import AnimatedButtonList from "@/components/apple-mail/animated-button";
import EmailItem from "@/components/apple-mail/email-item";
import { buttons } from "@/components/apple-mail/button-props";
import { emails } from "@/components/apple-mail/email-data";

export default function AppleMail() {
  const [activeIndex, setActiveIndex] = useState(0);

  const categories = ["Primary", "Transactions", "Updates", "Promotions"];
  const filteredEmails = emails.filter(
    (email) => email.category === categories[activeIndex]
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingBottom: 12,
        paddingHorizontal: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {buttons.map((btn, index) => (
          <AnimatedButtonList
            key={btn.label}
            label={btn.label}
            active={activeIndex === index}
            onPress={() => setActiveIndex(index)}
            defaultIcon={btn.defaultIcon}
            activeIcon={btn.activeIcon}
            color={btn.color}
          />
        ))}
      </View>

      <FlatList
        scrollEnabled={false}
        data={filteredEmails}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EmailItem item={item} />}
      />
    </ScrollView>
  );
}
