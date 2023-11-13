import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import {
  Alert,
  Pressable,
  useColorScheme,
  Text,
  View,
  AppState,
  AppStateStatus,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import "../global.css";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Used for dimissing web-browser after signing in
WebBrowser.maybeCompleteAuthSession({
  skipRedirectCheck: true,
});

const clientId = process.env.EXPO_PUBLIC_AWS_COGNITO_CLIENT_ID!;
const userPoolUrl = process.env.EXPO_PUBLIC_AWS_COGNITO_USER_POOL!;

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const redirectUri = AuthSession.makeRedirectUri();
  console.log("redirectUri: " + redirectUri);

  const [authTokens, setAuthTokens] =
    useState<AuthSession.TokenResponse | null>(null);
  const discoveryDocument = useMemo(
    () => ({
      authorizationEndpoint: userPoolUrl + "/oauth2/authorize",
      tokenEndpoint: userPoolUrl + "/oauth2/token",
      revocationEndpoint: userPoolUrl + "/oauth2/revoke",
    }),
    []
  );

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      responseType: AuthSession.ResponseType.Code,
      redirectUri,
      usePKCE: true,
      scopes: ["email", "openid", "profile"],
      prompt: AuthSession.Prompt.Login,
    },
    discoveryDocument
  );

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (!request) {
      return;
    }
    const exchangeFn = async (
      exchangeTokenReq: AuthSession.AccessTokenRequestConfig
    ) => {
      try {
        const exchangeTokenResponse = await AuthSession.exchangeCodeAsync(
          exchangeTokenReq,
          discoveryDocument
        );
        setAuthTokens(exchangeTokenResponse);
      } catch (error) {
        console.error(error);
      }
    };
    if (response) {
      console.log("Response Type: " + response.type);
      if (response.type === "error") {
        Alert.alert(
          "Authentication error",
          response.params.error_description || "something went wrong"
        );
        return;
      }
      if (response.type === "success" && request?.codeVerifier) {
        exchangeFn({
          clientId,
          code: response.params.code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier,
          },
        });
      }
    }
  }, [discoveryDocument, request, response]);

  useEffect(() => {
    console.log("AppState; " + AppState.currentState);
  }, [AppState.currentState]);

  if (!loaded) {
    return null;
  }

  const logout = async () => {
    if (!authTokens?.refreshToken) {
      console.error(
        "Auth Tokens are null, can't logout if you're already logged out"
      );
      return;
    }
    const revokeResponse = await AuthSession.revokeAsync(
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
  // Store the `resolve` function from a Promise to fire when the AppState
  // returns to active
  let _onWebBrowserClose: null | (() => void) = null;

  // Store previous app state to check whether the listener has ever been attached
  let _previousAppState: null | string = AppState.currentState;

  function _onAppStateChange(state: AppStateStatus) {
    // if _previousAppState is null, we assume that the first call to
    // AppState#change event is not actually triggered by a real change
    // (https://facebook.github.io/react-native/docs/appstate#basic-usage)
    if (_previousAppState === null) {
      _previousAppState = state;
      return;
    }

    if (state === "active" && _onWebBrowserClose) {
      _onWebBrowserClose();
    }
  }
  return authTokens ? (
    <RootLayoutNav />
  ) : (
    <View className="flex-1 items-center justify-center">
      <Text className="text-sky-500">{AppState.currentState}</Text>
      <Pressable onPress={() => promptAsync()}>
        <Text className="text-xl text-sky-500">Sign In</Text>
      </Pressable>
    </View>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}
