import { View, Text } from "react-native";

export default function HelloText() {
  return (
    <View className="dark:bg-black flex-1 items-center justify-center">
      <Text className="dark:text-white text-4xl">Hello There</Text>
    </View>
  );
}
