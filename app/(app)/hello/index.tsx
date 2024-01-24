import { View, Text, Pressable } from "react-native";
import React from "react";
import * as Next from "expo-sqlite/next";
import { openDB, deleteDB } from "../../../db-utils";

function HelloChild({
  database,
  onDeleteDb,
}: {
  database: Next.SQLiteDatabase | null;
  onDeleteDb: () => void;
}) {
  return (
    <>
      <Text className="dark:text-white text-4xl">Hello There</Text>
      <Pressable
        className="m-10 p-1 bg-slate-600 border-solid border-2 border-slate-400 active:opacity-50"
        onPress={onDeleteDb}
      >
        <Text className="text-lg/10 dark:color-white">Delete Database</Text>
      </Pressable>
    </>
  );
}

// Proof of concept for using database as "global" context
export default function HelloParent() {
  const [db, setDb] = React.useState<Next.SQLiteDatabase | null>(null);
  React.useEffect(() => {
    // Using a setTimeout function to simulate loading in the db
    // for 2 seconds b/c it normally loads too fast to even see the loading screen I wrote
    const timeoutId = setTimeout(() => {
      openDB().then((db) => {
        setDb(db);
      });
    }, 2000);
    // Turns out I have to return a cleanup function for the useEffect
    // or else the seTimeOut function doesn't reset it's timer when you delete the db.
    // It just continues to run from whatever the timer's countdown was before the deletion,
    // meaning the "...loading" screen would generally last shorter than the assigned 2 seconds
    // every time you pressed "Delete Database". It's an important thing to keep note of.
    // Even timers are resources that have to be freed! (That's what the clearTimeout function does... I think)
    return () => clearTimeout(timeoutId);
  });
  const onDeleteDb = () => {
    deleteDB().then(() => {
      setDb(null);
    });
  };
  return (
    <View className="dark:bg-black flex-1 items-center justify-center">
      {!db ? (
        <Text className="dark:text-white text-4xl">...Loading</Text>
      ) : (
        <HelloChild database={db} onDeleteDb={onDeleteDb} />
      )}
    </View>
  );
}
