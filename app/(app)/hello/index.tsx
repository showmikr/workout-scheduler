import { Pressable, StyleSheet } from "react-native";
import React from "react";
import { Text, View } from "../../../components/Themed";

function HelloChild() {
  return (
    <>
      <Text style={styles.text4xl}>Hello There</Text>
      <Pressable
        style={({ pressed }) => ({
          margin: 10,
          backgroundColor: "green",
          opacity: !pressed ? 1 : 0.75,
          borderRadius: 25,
          padding: 10,
        })}
      >
        <Text style={styles.textlg10}>Do Nothing</Text>
      </Pressable>
    </>
  );
}

// Proof of concept for using database as "global" context
export default function HelloParent() {
  const [isLoading, setLoading] = React.useState(true);
  React.useEffect(() => {
    // Using a setTimeout function to simulate loading in the db
    // for 2 seconds b/c it normally loads too fast to even see the loading screen I wrote
    const timeoutId = setTimeout(() => {
      console.log("finished fake loading");
      setLoading(false);
    }, 2000);
    // Turns out I have to return a cleanup function for the useEffect
    // or else the seTimeOut function doesn't reset it's timer when you delete the db.
    // It just continues to run from whatever the timer's countdown was before the deletion,
    // meaning the "...loading" screen would generally last shorter than the assigned 2 seconds
    // every time you pressed "Delete Database". It's an important thing to keep note of.
    // Even timers are resources that have to be freed! (That's what the clearTimeout function does... I think)
    return () => clearTimeout(timeoutId);
  });
  return (
    <View style={styles.viewBox}>
      {isLoading ?
        <Text style={styles.text4xl}>...Loading</Text>
      : <HelloChild />}
    </View>
  );
}

const styles = StyleSheet.create({
  viewBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text4xl: {
    fontSize: 2.25 * 14,
    lineHeight: 2.5 * 14,
  },
  textlg10: {
    fontSize: 1.125 * 14,
    lineHeight: 2.5 * 14,
  },
});
