import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { Button, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { styles } from "../index";
import { Link } from "expo-router";
import * as Linking from "expo-linking";

const springLocalServer = "http://localhost:8080/hello";

const GreetingText = () => {
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
      <Link style={[{ fontSize: 20 }]} href="/">
        HomePage
      </Link>
    </View>
  );
};

const MobileGreeting = () => {
  const _handlePressButtonAsync = async () => {
    let result = await WebBrowser.openBrowserAsync("https://expo.dev");
  };
  return (
    <View style={[{ alignItems: "center", justifyContent: "center", flex: 1 }]}>
      <Button
        title="Try Opening Mobile Browser"
        onPress={_handlePressButtonAsync}
      />
      <Text>Hello on Mobile</Text>
      <Link style={[{ fontSize: 20 }]} href="/">
        HomePage
      </Link>
    </View>
  );
};

export default MobileGreeting;
