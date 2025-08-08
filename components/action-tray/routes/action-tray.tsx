import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";

import { PressableScale } from "@/components/ui/utils/pressable-scale";
import { SymbolView } from "expo-symbols";
import DrawerButton from "../content/drawer-button";
import { Colors } from "../content/colors";
import Reasons from "../content/reasons";
import Header from "../content/header";
import KeyViewButton from "../content/keyViewButton";
import { useActionTray } from "../context/action-tray-context";

export const Palette = {
  primary: "#4290F6",
  background: "#FFF",
  surface: "#F1F1F4",
  text: "#B3B3B6",
};

const ActionTray = () => {
  const { openTray, closeTray } = useActionTray();

  const contentMap = useMemo(
    () => ({
      0: (
        <View className="gap-y-4">
          <View style={{ gap: 24 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "semibold",
                  fontFamily: "OpenRunde-semibold",
                }}
              >
                Options
              </Text>

              <PressableScale
                style={{
                  padding: 4,
                  aspectRatio: 1,
                  width: 32,
                  backgroundColor: Colors.grey[100],
                  borderRadius: 1000,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => closeTray()}
              >
                <SymbolView
            name="xmark.circle.fill"
            type="palette"
            size={35}

            colors={[ "#94999F", "#F7F7F7",]}
           
          />
              </PressableScale>
            </View>

            <View
              style={{
                height: 1,
                width: "100%",
                backgroundColor: Colors.grey[100],
              }}
            />
            
          </View>
          <DrawerButton
            onPress={() => openTray(1, contentMap)}
            backgroundColor={Colors.grey[100]}
            icon={<Octicons name="key" size={24} color={Colors.grey[300]} />}
            label="View Private Key"
          />
          <DrawerButton
            onPress={() => openTray(2, contentMap)}
            backgroundColor={Colors.grey[100]}
            icon={
              <Octicons name="package" size={24} color={Colors.grey[300]} />
            }
            label="View Recovery Phrase"
          />
          <DrawerButton
            onPress={() => openTray(3, contentMap)}
            backgroundColor={Colors.red[100]}
            icon={<Octicons name="alert" size={24} color={Colors.red[300]} />}
            label="Remove Wallet"
            textColor={Colors.red[300]}
          />
        </View>
      ),
      1: (
        <View style={{ gap: 24 }}>
          {/*Above Line*/}
          <View style={{ gap: 24 }}>
            {/*Header*/}
            <Header
              onPress={() => closeTray()}
              leftLabel={
                <Octicons name="eye" size={40} color={Colors.grey[300]} />
              }
            />

            <View style={{ gap: 16 }}>
              <Text style={{ fontSize: 24 }}>Private Key</Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "semibold",
                  fontFamily: "OpenRunde-semibold",
                  color: Colors.grey[300],
                }}
              >
                Your Private Key is the key used to back up your wallet. Keep it
                secret and secure at all times.
              </Text>
            </View>

            <View
              style={{
                height: 1,
                width: "100%",
                backgroundColor: Colors.grey[100],
              }}
            />
          </View>

          <Reasons />

          <View style={{ flexDirection: "row", gap: 16 }}>
            <KeyViewButton
              onPress={() => openTray(0, contentMap)}
              text="Cancel"
              backgroundColor={Colors.grey[200]}
            />
            <KeyViewButton
              onPress={() => openTray(0, contentMap)}
              text="Reveal"
              backgroundColor={"#00B2FF"}
              textColor="white"
              icon={
                <SymbolView name="faceid" tintColor={"white"} weight="bold" />
              }
            />
          </View>
        </View>
      ),
      2: (
        <View style={{ gap: 24 }}>
          {/*Above Line*/}
          <View style={{ gap: 24 }}>
            {/*Header*/}
            <Header
              onPress={() => closeTray()}
              leftLabel={
                <Octicons name="eye" size={40} color={Colors.grey[300]} />
              }
            />

            <View style={{ gap: 16 }}>
              <Text style={{ fontSize: 24 }}>Secret Recovery Phrase</Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "semibold",
                  fontFamily: "OpenRunde-semibold",
                  color: Colors.grey[300],
                }}
              >
                Your Secret Recovery Phrase is the key used to back up all your
                wallet. Keep it secret and secure at all times.
              </Text>
            </View>

            <View
              style={{
                height: 1,
                width: "100%",
                backgroundColor: Colors.grey[100],
              }}
            />
          </View>

          <Reasons />

          <View style={{ flexDirection: "row", gap: 16 }}>
            <KeyViewButton
              onPress={() => openTray(0, contentMap)}
              text="Cancel"
              backgroundColor={Colors.grey[200]}
            />
            <KeyViewButton
              onPress={() => openTray(0, contentMap)}
              text="Reveal"
              backgroundColor={"#00B2FF"}
              textColor="white"
              icon={
                <SymbolView name="faceid" tintColor={"white"} weight="bold" />
              }
            />
          </View>
        </View>
      ),
      3: (
        <View style={{ gap: 24 }}>
          <Header
            onPress={() => closeTray()}
            leftLabel={
              <Octicons name="alert" size={40} color={Colors.red[300]} />
            }
          />

          <View style={{ gap: 16 }}>
            <Text style={{ fontSize: 24 }}>Are you sure?</Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "semibold",
                fontFamily: "OpenRunde-semibold",
                color: Colors.grey[300],
              }}
            >
              You haven't backed up your wallet yet. If you remove it, you could
              lose access forever. We suggest tapping and backing up your wallet
              first with a valid recovery method.
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 16 }}>
            <KeyViewButton
              onPress={() => openTray(0, contentMap)}
              text="Cancel"
              backgroundColor={Colors.grey[200]}
            />
            <KeyViewButton
              onPress={() => openTray(0, contentMap)}
              text="Continue"
              backgroundColor={Colors.red[300]}
              textColor="white"
            />
          </View>
        </View>
      ),
    }),
    []
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Palette.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <PressableScale
        style={[
          {
            marginTop: 200,
            height: 50,
            backgroundColor: Palette.primary,
            borderRadius: 25,
            aspectRatio: 1,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
        onPress={() => openTray(0, contentMap)}
      >
        <MaterialCommunityIcons
          name="plus"
          size={25}
          color={Palette.background}
        />
      </PressableScale>
    </View>
  );
}

export default ActionTray
