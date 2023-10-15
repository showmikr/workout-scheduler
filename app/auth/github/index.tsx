import { Button, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { useEffect } from "react";
import { styles } from "../../index";

export default () => {
  return (
    <View style={styles.container}>
      <Button title="Login with Github"></Button>
    </View>
  );
};
