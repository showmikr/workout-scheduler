import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button, StyleSheet, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLIENT_ID = "8a308561f3aeb41d9969";
const CLIENT_ID_TEST_MOBILE = "c836d33329427d2050f6";
const CLIENT_ID_TEST_WEB = "ca1743b472e63f27cefe";
const CLIENT_SECRET_TEST_WEB = "" 

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: 'https://github.com/settings/connections/applications/' + CLIENT_ID_TEST_WEB,
};

export default function App() {
  const [token, setToken] = React.useState("");
  const [userInfo, setUserInfo] = React.useState(null);


  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID_TEST_WEB,
      scopes: ['identity'],
      redirectUri: makeRedirectUri({
        preferLocalhost: true,
      }),
    },
    discovery
  );


  React.useEffect(() => {
    if(response?.type === "success"){
      const { code } = response.params
      setToken(response.params.code)
      console.log(code);
      handleSignInWithGitHub();
    }
    
  }, [response]);

  async function handleSignInWithGitHub() {
    const user = await getLocalUser();

    if (!user) {
      if(response?.type === 'success') {
        getUserInfo(token);
        console.log("here");
      }
      else {
        console.log("bruh")
      }
    } else {
      setUserInfo(JSON.parse(user));
      console.log("loaded locally");
    }
  }

  const getLocalUser = async () => {
    const data = await AsyncStorage.getItem("@user");
    if (!data) return null;
    return JSON.parse(data);
  };

  const getUserInfo = async (token) => {
    if (!token) return;
    try {
      const authString = btoa(CLIENT_ID_TEST_WEB + ":" + CLIENT_SECRET_TEST_WEB)
      const response = await fetch("https://api.github.com/authorizations",
        {
          headers: {
            method: 'post',
            Authorization: authString,
          },
        }
        // const params = "?client_id=" + CLIENT_ID_TEST_WEB + "&client_secret=" + CLIENT_SECRET_TEST_WEB + "&code=" + token;
        // const response = await fetch("https://github.com/login/oauth/access_token" + params, {
        //   method: "POST",
        //   headers: {
        //     "Accept": "application/json"
        //   },
        // }
      );
        const user = await response.json();
        console.log(response)
        await AsyncStorage.setItem("@user", JSON.stringify(user));
        setUserInfo(user);
    } catch (error) {
      console.log("getUserInfo Error | " + error);
    }
    
  }

  return (
    <View style={styles.container}>
      <Text>{JSON.stringify(userInfo)}</Text>
      <Button 
        disabled={!request}
        title="Sign in with GitHub"
        onPress={() => {
          promptAsync();
        }}
      />
      <Text>Open up App.js to start working on your app!</Text>
      <Button title="Delete Local Storage" onPress={async () => await AsyncStorage.removeItem("@user")}></Button>
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