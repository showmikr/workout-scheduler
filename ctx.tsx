import React, { useEffect, useMemo, useState } from "react";
import { useStorageState } from "./useStorageState";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";

// This represents the default initialized AuthContext
// This initial version is always supposed to be overriden with properties/functions that actually do something.
const AuthContext = React.createContext<{
  signIn: () => void;
  signOut: () => void;
  session: string | null; // session will need to be an object with multiple properties such as {username, idToken, email, etc} in the future
  isLoading: boolean;
}>({
  signIn: () => {
    // No behavior initialized
  },
  signOut: () => {
    // No behavior initialized
  },
  session: null,
  isLoading: true,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }
  return value;
}

// Used for dimissing web-browser after signing in
WebBrowser.maybeCompleteAuthSession({
  skipRedirectCheck: true,
});

const clientId = process.env.EXPO_PUBLIC_AWS_COGNITO_CLIENT_ID!;
const userPoolUrl = process.env.EXPO_PUBLIC_AWS_COGNITO_USER_POOL!;
const redirectUri = AuthSession.makeRedirectUri();
console.log("redirectUri: " + redirectUri);

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");
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
      clientId: clientId,
      responseType: AuthSession.ResponseType.Code,
      redirectUri: redirectUri,
      usePKCE: true,
      scopes: ["email", "openid", "profile"],
      prompt: AuthSession.Prompt.Login,
    },
    discoveryDocument
  );

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
        console.log("session is loading");
        setTimeout(
          () => setSession(JSON.stringify(exchangeTokenResponse)),
          4000
        );
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

  return (
    <AuthContext.Provider
      value={{
        signIn: promptAsync,
        signOut: () => {
          const authTokens = session
            ? (JSON.parse(session) as AuthSession.TokenResponse)
            : null;
          if (!authTokens?.refreshToken) {
            console.log("in ctx.tsx, calling signOut function");
            console.error(
              "Auth Tokens are null, can't logout if you're already logged out"
            );
            return;
          }
          WebBrowser.openAuthSessionAsync(
            `${userPoolUrl}/logout?client_id=${clientId}&logout_uri=${redirectUri}`
          )
            .then((authSessionResult) => {
              if (
                authSessionResult.type === "cancel" ||
                authSessionResult.type === "dismiss"
              ) {
                // Since the user is cancelling the logout flow, we do nothing
                return;
              } else if (authSessionResult.type === "success") {
                setSession(null);
              }
            })
            .catch((err) => {
              console.error("browser problem: " + err);
            });
        },
        session,
        isLoading: isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
