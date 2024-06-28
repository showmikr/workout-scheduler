import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useStorageState } from "./useStorageState";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";

const enableFakeAuth: boolean = true;

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

if (!process.env.EXPO_PUBLIC_AWS_COGNITO_CLIENT_ID) {
  throw new Error(
    "clientId environment variable (aws cognito client id) was not found"
  );
}

if (!process.env.EXPO_PUBLIC_AWS_COGNITO_USER_POOL) {
  throw new Error(
    "userPoolUrl environment variable (aws cognito user pool) was not found"
  );
}

const clientId = process.env.EXPO_PUBLIC_AWS_COGNITO_CLIENT_ID;
const userPoolUrl = process.env.EXPO_PUBLIC_AWS_COGNITO_USER_POOL;

const redirectUri = AuthSession.makeRedirectUri();
console.log("redirectUri: " + redirectUri);

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");
  const fakeSignOut = useCallback(() => {
    setSession(null);
  }, []);
  const fakeSignIn = useCallback(() => {
    // putting fake info into setSession
    setSession(
      JSON.stringify({
        subjectClaim: "c8bf7e34-7dcf-11ee-b962-0242ac120002",
        accessToken: "fake_access_token",
        tokenType: "bearer",
        issuedAt: Math.floor(Date.now() / 1000),
      })
    );
  }, []);
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
        signIn:
          enableFakeAuth ? fakeSignIn : (
            () =>
              promptAsync({
                // @ts-expect-error
                preferEphemeralSession: true, // prevents the mobile browser from remembering username and password
              })
          ),
        signOut:
          enableFakeAuth ? fakeSignOut : (
            () => {
              if (!session) {
                throw new Error("session is null");
              }
              const authTokens = JSON.parse(
                session
              ) as AuthSession.TokenResponse;
              AuthSession.revokeAsync(
                {
                  clientId: clientId,
                  token: authTokens.accessToken,
                },
                discoveryDocument
              )
                .then((response) => {
                  if (response) {
                    console.log(
                      "Auth Server successfully revoked access token."
                    );
                  } else {
                    console.log(
                      "Auth server could NOT revoke access tokens. \
                    However, you're seeing this log b/c we got a response back from the auth server, \
                    so at least we're online."
                    );
                  }
                })
                .catch((err) => {
                  console.error(err);
                })
                .finally(() => {
                  /**
                   * Always log the user out whether they are online or offline
                   * no matter what the auth server says (as to whether it could revoke the tokens or not).
                   * This will likely need to change for production.
                   */
                  setSession(null);
                });
            }
          ),
        session,
        isLoading: isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
