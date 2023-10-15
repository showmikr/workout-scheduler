import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { StatusBar } from "expo-status-bar";
import React from "react";
import * as WebBrowser from "expo-web-browser";
import { StyleSheet, Text, View, Platform, Button } from "react-native";
import { Link } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

const GitHubLoginBtn = () => {
  const gitHubClientId = Platform.select({
    ios: "c836d33329427d2050f6",
    android: "c836d33329427d2050f6",
    default: "ca1743b472e63f27cefe",
  });
  console.log("Platform: " + Platform.OS);
  console.log("gitHubClientId: " + gitHubClientId);

  // Endpoint
  const discovery = {
    authorizationEndpoint: "https://github.com/login/oauth/authorize",
    tokenEndpoint: "https://github.com/login/oauth/access_token",
    revocationEndpoint: `https://github.com/settings/connections/applications/${gitHubClientId}`,
  };
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: gitHubClientId,
      scopes: ["identity"],
      redirectUri: makeRedirectUri({
        scheme: "workoutscheduler",
      }),
    },
    discovery
  );
  React.useEffect(() => {
    (async () => {
      if (response?.type !== "success") {
        console.log("Unsuccessful response, response type: " + response?.type);
        return;
      }
      const { code } = response.params;
      console.log("params" + JSON.stringify(response.params));
      fetch(`localhost:8080/`);
    })();
  }, [response]);
  return (
    <Button
      disabled={!request}
      title="Login w/ GitHub"
      onPress={() => {
        promptAsync();
      }}
    />
  );
};

export default function Page() {
  return (
    <View style={[styles.container]}>
      <Text>Open up index.tsx to start working on your app!</Text>
      <Link style={[{ fontSize: 20 }]} href="/hello">
        Real GitHub Login Button
      </Link>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export { styles };
