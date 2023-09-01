import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { Button } from "react-native";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

const githubClientId = "c836d33329427d2050f6";

// Endpoint
const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint: `https://github.com/settings/connections/applications/${githubClientId}`,
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: githubClientId,
      scopes: ["identity"],
      redirectUri: makeRedirectUri({
        preferLocalhost: true,
      }),
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
      <Button disabled={!request} title="Login" onPress={() => promptAsync()} />
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
