import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import "core-js/stable/atob";
import { JwtPayload, jwtDecode } from "jwt-decode";

if (process.env.EXPO_PUBLIC_ENABLE_FAKE_AUTH === undefined) {
  throw new Error(
    "enable fake auth environment variable (true/false) was not found"
  );
}

const enableFakeAuth: boolean =
  process.env.EXPO_PUBLIC_ENABLE_FAKE_AUTH === "true";

const AWS_COGNITO_ACCESS_TOKEN_KEYWORD = "accessToken";
const AWS_COGNITO_REFRESH_TOKEN_KEYWORD = "refreshToken";
const AWS_COGNITO_ID_TOKEN_KEYWORD = "idToken";

type SessionInfo = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  issuedAt: number; // seconds since Unix epoch
  expirationTime: number; // seconds since Unix epoch
  subjectClaim: string;
  username: string;
  email: string;
  emailVerified: boolean;
};

// This represents the default initialized AuthContext
// This initial version is always supposed to be overriden with properties/functions that actually do something.
const AuthContext = React.createContext<{
  signIn: () => void;
  signOut: () => void;
  session: SessionInfo | null;
}>({
  signIn: () => {
    // No behavior initialized
  },
  signOut: () => {
    // No behavior initialized
  },
  session: null,
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
  const [session, setSession] = useState<SessionInfo | null>(null);
  const fakeSignOut = useCallback(() => {
    setSession(null);
  }, []);
  const fakeSignIn = useCallback(() => {
    // putting fake info into setSession
    setSession({
      accessToken: "fake_access_token",
      refreshToken: "fake_refresh_token",
      idToken: "fake_id_token",
      subjectClaim: "c8bf7e34-7dcf-11ee-b962-0242ac120002",
      email: "joeschmo@fakemail.com",
      emailVerified: true,
      username: "joeypapaya",
      issuedAt: 123405,
      expirationTime: 23456,
    });
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
        const { accessToken, refreshToken, idToken } =
          await AuthSession.exchangeCodeAsync(
            exchangeTokenReq,
            discoveryDocument
          );
        if (!(accessToken && refreshToken && idToken)) {
          throw new Error("Invariant broken. Access Token was not found");
        }
        SecureStore.setItemAsync(AWS_COGNITO_ACCESS_TOKEN_KEYWORD, accessToken);
        SecureStore.setItemAsync(
          AWS_COGNITO_REFRESH_TOKEN_KEYWORD,
          refreshToken ?? ""
        );
        SecureStore.setItemAsync(AWS_COGNITO_ID_TOKEN_KEYWORD, idToken ?? "");

        const { sub, iat, exp, username } = jwtDecode<
          JwtPayload & { username?: string }
        >(accessToken);
        const { email, email_verified } = jwtDecode<
          JwtPayload & { email?: string; email_verified?: boolean }
        >(idToken);
        if (!(sub && iat && exp && username && email && email_verified)) {
          throw new Error(
            "one of the necessary jwt claims from aws cognito auth is missing"
          );
        }
        // temporary "fix" for setting session
        setSession({
          accessToken: accessToken,
          email: email,
          emailVerified: email_verified,
          refreshToken: refreshToken,
          expirationTime: exp,
          issuedAt: iat,
          idToken: idToken,
          subjectClaim: sub,
          username: username,
        });
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
            async () => {
              try {
                if (!session) {
                  throw new Error("session is null");
                }
                const refreshToken =
                  await SecureStore.getItemAsync("refreshToken");
                if (!refreshToken) {
                  throw new Error(
                    "AWS Cognito Refresh Token was not found in secure store"
                  );
                }
                const revokedSuccessfully = await AuthSession.revokeAsync(
                  {
                    clientId: clientId,
                    token: refreshToken,
                  },
                  discoveryDocument
                );
                if (revokedSuccessfully) {
                  console.log(
                    "Auth Server successfully revoked refresh token."
                  );
                } else {
                  console.log(
                    "Auth server could NOT revoke refresh token. \
                    However, you're seeing this log b/c we got a response back from the auth server, \
                    so at least we're online."
                  );
                }
              } catch (err) {
                console.error(err);
              } finally {
                /**
                 * Always log the user out whether they are online or offline
                 * no matter what the auth server says (as to whether it could revoke the tokens or not).
                 * This will likely need to change for production.
                 */
                SecureStore.deleteItemAsync(AWS_COGNITO_ACCESS_TOKEN_KEYWORD);
                SecureStore.deleteItemAsync(AWS_COGNITO_REFRESH_TOKEN_KEYWORD);
                SecureStore.deleteItemAsync(AWS_COGNITO_ID_TOKEN_KEYWORD);
                setSession(null);
              }
            }
          ),
        session,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
