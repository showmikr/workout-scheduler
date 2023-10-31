import {
  useAuthRequest,
  exchangeCodeAsync,
  revokeAsync,
  ResponseType,
  makeRedirectUri,
  TokenResponse,
  AccessTokenRequestConfig,
} from "expo-auth-session";
import { StatusBar } from "expo-status-bar";
import React from "react";
import * as WebBrowser from "expo-web-browser";
import { StyleSheet, Text, View, Platform, Button, Alert } from "react-native";
import { Link } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

const clientId = process.env.EXPO_PUBLIC_AWS_COGNITO_CLIENT_ID!;
const userPoolUrl = process.env.EXPO_PUBLIC_AWS_COGNITO_USER_POOL!;

const redirectUri = makeRedirectUri();

export default function Page() {
  const [authTokens, setAuthTokens] = React.useState<TokenResponse | null>(
    null
  );
  const discoveryDocument = React.useMemo(
    () => ({
      authorizationEndpoint: userPoolUrl + "/oauth2/authorize",
      tokenEndpoint: userPoolUrl + "/oauth2/token",
      revocationEndpoint: userPoolUrl + "/oauth2/revoke",
    }),
    []
  );

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      responseType: ResponseType.Code,
      redirectUri,
      usePKCE: true,
    },
    discoveryDocument
  );

  React.useEffect(() => {
    const exchangeFn = async (exchangeTokenReq: AccessTokenRequestConfig) => {
      try {
        const exchangeTokenResponse = await exchangeCodeAsync(
          exchangeTokenReq,
          discoveryDocument
        );
        setAuthTokens(exchangeTokenResponse);
        console.log(exchangeTokenResponse);
      } catch (error) {
        console.error(error);
      }
    };
    if (response && request) {
      if (response?.type === "error") {
        Alert.alert(
          "Authentication error",
          response.params.error_description || "something went wrong"
        );
        return;
      }
      if (response.type === "success" && request.codeVerifier) {
        exchangeFn({
          clientId,
          code: response.params.code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier,
          },
        });
      } else {
        console.log("Code Verifier query parameter is null");
        console.log("can't exchange authorization code for token without it");
      }
    }
  }, [discoveryDocument, request, response]);

  const logout = async () => {
    if (!authTokens || !authTokens.refreshToken) {
      console.log("Can't logout b/c refreshToken doesn't exist. idk how tho");
      return;
    }
    const revokeResponse = await revokeAsync(
      {
        clientId: clientId,
        token: authTokens.refreshToken,
      },
      discoveryDocument
    );
    if (revokeResponse) {
      setAuthTokens(null);
    }
  };
  console.log("authTokens: " + JSON.stringify(authTokens));
  return (
    <View style={[styles.container]}>
      <Text>Open up index.tsx to start working on your app!</Text>
      {authTokens ? (
        <Button title="Logout" onPress={() => logout()} />
      ) : (
        <Button
          disabled={!request}
          title="Login"
          onPress={() => promptAsync()}
        />
      )}
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
