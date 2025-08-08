import React, { FC } from "react";
import { Pressable, Alert } from "react-native";
import { EDIT_HOME_CONTAINER_WIDTH } from "../../../lib/providers/home-animation";
import { Settings2 } from "lucide-react-native";

// raycast-home-search-transition-animation 🔽

export const EditHomeButton: FC = () => {
  return (
    <Pressable
      onPress={() => Alert.alert("Edit Home")}
      className="items-center justify-center"
      style={{ width: EDIT_HOME_CONTAINER_WIDTH }}
    >
      <Settings2 size={24} color="#000" />
    </Pressable>
  );
};

// raycast-home-search-transition-animation 🔼
