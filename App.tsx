import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button, StyleSheet, View, Text } from 'react-native';

const CLIENT_ID = "8a308561f3aeb41d9969";
const CLIENT_ID_TEST_MOBILE = "c836d33329427d2050f6";
const CLIENT_ID_TEST_WEB = "ca1743b472e63f27cefe";

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: 'https://github.com/settings/connections/applications/' + CLIENT_ID_TEST_MOBILE,
};

export default function App() {

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID_TEST_MOBILE,
      scopes: ['identity'],
      redirectUri: makeRedirectUri({
        preferLocalhost: true,
      }),
    },
    discovery
  );

  React.useEffect(() => {
    //console.log(response?.type)
    if (response?.type === 'success') {
      const { code } = response.params;
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Button 
        disabled={!request}
        title="Login"
        onPress={() => {
          promptAsync();
        }}
      />
      <Text>Open up App.js to start working on your app!</Text>
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