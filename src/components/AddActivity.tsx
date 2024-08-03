import { View, Text, StyleSheet, Pressable, SectionList } from "react-native";
import ResistanceIcon from "@/assets/icons/resistance_icon_grey.svg";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { forwardRef } from "react";
import GenericBottomSheet from "./GenericBottomSheet";
import { TextInput } from "react-native-gesture-handler";
import { ActivityCard } from "@/components/ActivityCard";

type WorkoutSession = {
  sessionId: number;
  title: string;
  calories: number;
  elapsedTime: number;
  date: Date;
};

function groupActivityCards(list: WorkoutSession[]) {
  let res: { title: string; data: WorkoutSession[] }[] = [];
  let ind = 0;

  list.forEach((card) => {
    if (res.length === 0) {
      res.push({
        title:
          card.date.toLocaleString("default", { month: "long" }) +
          ", " +
          card.date.getFullYear(),
        data: [card],
      });
    } else if (
      res[ind].title !==
      card.date.toLocaleString("default", { month: "long" }) +
        ", " +
        card.date.getFullYear()
    ) {
      ind += 1;
      res.push({
        title:
          card.date.toLocaleString("default", { month: "long" }) +
          ", " +
          card.date.getFullYear(),
        data: [card],
      });
    } else {
      res[ind].data.push(card);
    }
  });

  return res;
}

const AddActivity = forwardRef(
  (props: any, ref: React.Ref<BottomSheetModal>) => {
    const activityCardSamples: WorkoutSession[] = [
      {
        sessionId: 1,
        title: "Incline Dumbbell Press",
        calories: 100,
        elapsedTime: 10,
        date: new Date(),
      },
      {
        sessionId: 2,
        title: "Pull-Up",
        calories: 100,
        elapsedTime: 10,
        date: new Date(),
      },
      {
        sessionId: 3,
        title: "Bent-Over Row",
        calories: 100,
        elapsedTime: 10,
        date: new Date(),
      },
      {
        sessionId: 4,
        title: "Squat",
        calories: 100,
        elapsedTime: 10,
        date: new Date(),
      },
    ];

    return (
      <GenericBottomSheet ref={ref} snapPoints={props.snapPoints}>
        <BottomSheetView style={styles.container}>
          <Text style={styles.title}>Record Workout Session</Text>
          <SectionList
            style={{ backgroundColor: "#0D0D0D" }}
            //groupActivityCards(activityCardSamples)
            sections={groupActivityCards(
              activityCardSamples
                .filter((obj) => obj.date >= new Date())
                .slice()
                .reverse()
            )}
            renderItem={({ item }) => (
              <ActivityCard
                title={item.title}
                calories={item.calories}
                date={item.date}
              />
            )}
          />
          <Pressable
            style={{
              width: "90%",
              backgroundColor: "#A53535",
              borderRadius: 10,
              height: 50,
              bottom: 30,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => {
              console.log("redirect to buildsession");
            }}
          >
            <Text
              style={{
                // justifyContent: "center",
                // alignContent: "center",
                // textAlign: "center",
                // alignItems: "center",

                color: "white",
                fontSize: 20,
              }}
            >
              Record Custom Workout
            </Text>
          </Pressable>

          {/* <TextInput
            style={styles.fillButton}
            keyboardType="ascii-capable"
            placeholder="Enter workout name"
            maxLength={30}
          />
          <TextInput
            style={styles.fillButton}
            keyboardType="ascii-capable"
            placeholder="Elapsed Time 4:20-5:45PM"
            maxLength={30}
          /> */}
        </BottomSheetView>
      </GenericBottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    alignItems: "center",
  },
  title: {
    color: "#BDBDBD",
    fontSize: 22,
    fontWeight: "bold",
    padding: 20,
  },
  // fillButton: {
  //   backgroundColor: "#2F2F2F",
  //   borderRadius: 10,
  //   padding: 5,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   width: "60%",
  //   marginTop: 10,

  //   fontSize: 20,
  //   fontWeight: "300",
  //   color: "#BDBDBD",
  //   textAlign: "center",
  // },
});

export default AddActivity;
