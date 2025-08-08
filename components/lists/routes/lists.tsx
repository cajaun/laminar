import { TextInput, View, Switch } from "react-native";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as AC from "@bacons/apple-colors";

import * as Form from "@/components/ui/utils/forms";

const Lists = () => {
  const { top, bottom } = useSafeAreaInsets();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <Form.List navigationTitle="Account">
      <Form.Section>
        <Form.HStack style={{ gap: 12 }}>
          <Image
            source={{ uri: "https://github.com/cajaun.png" }}
            style={{
              aspectRatio: 1,
              height: 48,
              borderRadius: 999,
            }}
          />
          <View style={{ gap: 4 }}>
            <Form.Text style={Form.FormFont.default}>Cajaun Campbell</Form.Text>
            <Form.Text style={Form.FormFont.caption}>
              cajaun@yahoo.com
            </Form.Text>
          </View>
        </Form.HStack>
        <Form.Link
          href="/action-tray"
          hint="Cajaun"
          systemImage={{ name: "gamecontroller.fill" }}
        >
          Game Center
        </Form.Link>
      </Form.Section>

      <Form.Section title="Personal Info">
        <Form.FormItem>
          <Form.TextField
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
            returnKeyType="next"
            textContentType="givenName"
            hint="First Name"
          />
        </Form.FormItem>
        <Form.FormItem>
          <Form.TextField
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
            returnKeyType="next"
            textContentType="givenName"
            hint="Last Name"
          />
        </Form.FormItem>
      </Form.Section>

      <Form.Section title="Personal Info">
        <Form.FormItem>
          <Form.TextField
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            returnKeyType="next"
            textContentType="givenName"
          />
        </Form.FormItem>
      </Form.Section>

      <Form.Section title="Preferences">
        <Form.Toggle
          systemImage="bell"
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        >
          Notifications
        </Form.Toggle>
      </Form.Section>

      <Form.Section></Form.Section>

      <Form.Section>
        <Form.Link href="/">Personalized Recommendations</Form.Link>
      </Form.Section>


      <Form.Section title="Account" footer= "For the best results, select the language you mainly speak. If it's not listed it may still be supported via auto-detection.">
        <Form.Text hint="cajaun@yahoo.com" systemImage={{ name: "envelope" }}>Email</Form.Text>
        <Form.Text  hint="Free Plan" systemImage={{ name: "creditcard" }}>Subscription</Form.Text>
        <Form.Text  systemImage={{ name: "arrow.up.circle" }}>Upgrade to ChatGPT Plus</Form.Text>
        <Form.Text  systemImage={{ name: "arrow.counterclockwise.circle" }}>Restore purchases</Form.Text>
        <Form.Link href="/" systemImage={{ name: "paintbrush" }}>Personalization</Form.Link>
        <Form.Link href="/" systemImage={{ name: "bell" }}>Notifications</Form.Link>
        <Form.Link href="/" systemImage={{ name: "slider.horizontal.3" }}>Data Controls</Form.Link>
        <Form.Link href="/" systemImage={{ name: "tray.full" }}>Archived Chats</Form.Link>
        <Form.Link href="/" systemImage={{ name: "lock.shield" }}>Security</Form.Link>
      </Form.Section>


      <Form.Section title="Hints">
        <Form.Text hint="Long hint with extra content that should float below the content">
          Normal
        </Form.Text>

        <Form.HStack style={{ flexWrap: "wrap" }}>
          <Form.Text>Wrap Below</Form.Text>
     
          <View style={{ flex: 1 }} />
         
          <Form.Text style={{ flexShrink: 1, color: AC.secondaryLabel }}>
            Long list of text that should wrap around when it gets too long
          </Form.Text>
        </Form.HStack>
      </Form.Section>
    </Form.List>
  );
};

export default Lists;
