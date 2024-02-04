import { View, Text, Pressable } from "react-native";
import React from "react";

function HelloChild() {
  return (
    <>
      <Text className="text-4xl dark:text-white">Hello There</Text>
      <Pressable className="m-10 border-2 border-solid border-slate-400 bg-slate-600 p-1 active:opacity-50">
        <Text className="text-lg/10 dark:color-white">Do Nothing</Text>
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
    <View className="flex-1 items-center justify-center dark:bg-black">
      {isLoading ?
        <Text className="text-4xl dark:text-white">...Loading</Text>
      : <HelloChild />}
    </View>
  );
}
