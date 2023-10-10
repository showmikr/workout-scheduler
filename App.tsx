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
      );
        const user = await response.json();
        console.log(response)
        await AsyncStorage.setItem("@user", JSON.stringify(user));
        setUserInfo(user);
    } catch (error) {
      console.log("getUserInfo Error | " + error);
    }
    
  }

  //////////////////////////////////////////////////////////
  // Test Data Base Calls Methods Below, Real Stuff Above //
  //////////////////////////////////////////////////////////


const [TDB_Value, TDBsetValue] = React.useState("null");

async function TDB_SendRequest() {
  console.log("TDB Request Received")
  //TDBsetValue("Hello Dad")
  try {
    const TDB_Response = await fetch("http://localhost:8080/whatisforlunch",
    {
      headers: {
        method: 'get',
      },
    }
    );
      const TDB_Meal = await TDB_Response.json()
      TDBsetValue(TDB_Meal.Meal)
  } catch(error){
    console.log("TDB_SendRequest Error | " + error)
  }
}



const [payloadInput, setpayloadInput] = React.useState("null");
const [Payload, setPayloadData] = React.useState("null");

async function SendPayload() {
  try {
    const Response = await fetch("http://localhost:8080/payload?payload=" + payloadInput,
    {
      headers: {
        method: 'get',
      },
    }
    );
      const result = await Response.json()
      setPayloadData(result.Payload)
  } catch(error){
    console.log("SendPayload Error | " + error)
  }
}


  

  return (
    <View style={styles.container}>
      
      {/* Auth Buttons*/}
      <div style={{display: "flex"}}>
        <div style={{paddingRight: "10px"}}>
        <Button disabled={!request} title="Sign in with GitHub" onPress={() => {promptAsync();}}/>
        </div>
        <div style={{paddingLeft: "10px"}}>
          <Button title="Delete Local Storage" onPress={async () => await AsyncStorage.removeItem("@user")}/>
        </div>
      </div>
      <Text>{JSON.stringify(userInfo)}</Text>

      <Text> </Text>
      <Text> </Text>

      {/* Request Buttons*/}
      <div style={{display: "flex"}}>
        <div style={{paddingRight: "10px"}}>
          <Button
            title="Send TDB Request"
            onPress={() => {TDB_SendRequest()}}
          />
        </div>

        <div style={{paddingLeft: "10px"}}>
          <Button
          title="Reset TDB Request"
          onPress={() => {TDBsetValue("null")}}/>
        </div>
      </div>
      <Text>{TDB_Value}</Text>

      <Text> </Text>
      <Text> </Text>


      {/* Payload Buttons*/}
      <div style={{display: "flex"}}>
        <div style={{paddingLeft: "20px"}}>
          <Button
            title="Send Payload"
            onPress={() => {SendPayload()}}
          />
        </div>

        <div style={{paddingLeft: "20px"}}>
          <Button
          title="Reset Data"
          onPress={() => {setPayloadData("null")}}/>
        </div>

        <div style={{paddingLeft: "20px"}}>
        <label>
        <label>
          Payload: 
          <input
            value={payloadInput}
            onChange={e => setpayloadInput(e.target.value)}
          />
        </label>
        </label>
        </div>
      </div>
      <Text>{Payload}</Text>

      

      
      
      
      
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