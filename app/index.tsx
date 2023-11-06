import {
  AccessTokenRequestConfig,
  ResponseType,
  TokenResponse,
  exchangeCodeAsync,
  makeRedirectUri,
  revokeAsync,
  useAuthRequest,
} from "expo-auth-session";
import React from "react";
import { StyleSheet, Button, Text, View } from "react-native";

export default function Page() {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
      <Text>Blank Slate, do whatever</Text>
    </View>
  );
}
