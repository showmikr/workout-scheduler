import { SQLiteDatabase } from "expo-sqlite/next";
import { TaggedWorkout } from "../app/(app)/(tabs)/workouts";

/* 
This function requires that we pass a database connection handle.
In general this means we will need to pass it via a db context (i.e useSQLiteContext())
*/
function getWorkouts(db: SQLiteDatabase) {
  const workout_tags = db.getAllSync<any>(
    `
      SELECT wk.id, wk.title as wk_title, wkt.title FROM workout AS wk
      LEFT JOIN link_tag_workout AS ltw ON ltw.workout_id = wk.id
      LEFT JOIN workout_tag AS wkt ON ltw.workout_tag_id = wkt.id
      WHERE wk.app_user_id = 1 AND wk.training_day_id IS NULL
      ORDER BY wk.id;
      `,
    null
  );
  const taggedWorkouts: TaggedWorkout[] = workout_tags
    .reduce((prev: any[], curr) => {
      const p = prev;
      if (p.length < 1 || p.at(-1).at(-1).id !== curr.id) {
        p.push([curr]);
      } else {
        p.at(-1).push(curr);
      }
      return p;
    }, [])
    .map((group: any[]) => ({
      id: group.at(0).id,
      title: group.at(0).wk_title,
      tags: group.reduce((tagList, wo) => {
        if (wo.title) {
          tagList.push(wo.title);
        }
        return tagList;
      }, []),
    }));
  return taggedWorkouts;
}

export { getWorkouts };
