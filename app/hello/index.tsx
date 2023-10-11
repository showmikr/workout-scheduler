import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { Text, View } from "react-native";
import { useEffect, useState } from "react";
import { styles } from "../index";

const GreetingText = () => {
  const springLocalServer = "http://localhost:8080/hello";
  const [msg, setMsg] = useState<string | null>();
  useEffect(() => {
    (async () => {
      fetch(springLocalServer, { credentials: "include" })
        //.then((res) => res.json())
        .then((res) => {
          console.log(res);
          if (res.redirected) {
            console.log("redirected: true");
            console.log(res.url);
            document.location = res.url;
          }
          return res.json();
        })
        .then((json) => setMsg(json.message))
        .catch((err) => console.log(err));
    })();
  }, []);
  return (
    <View style={[{ alignItems: "center", justifyContent: "center", flex: 1 }]}>
      <Text>Hello</Text>
      <Text>{msg}</Text>
    </View>
  );
};

export default GreetingText;
