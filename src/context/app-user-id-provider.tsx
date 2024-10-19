import { useSQLiteContext } from "expo-sqlite";
import { createContext, useContext, useState } from "react";
import { createStore, useStore } from "zustand";
import { useSession } from "./session-provider";

type AppUserIdState = { appUserId: number };

const AppUserIdStoreContext = createContext<ReturnType<
  typeof createAppUserIdStore
> | null>(null);

const createAppUserIdStore = (appUserId: number) =>
  createStore<AppUserIdState>()((set, get) => {
    return {
      appUserId,
    };
  });

/**
 * Used for accessing the app_user_id field in the sqlite db.
 * Relies on both a SessionProvider context and Sqlite context.
 * Ensure that that AppUserIdProvider is nested within both of
 * the above context providers or it will throw an error
 *
 * You might me thinking, "if you're just storing a single read-only value,
 * why did you put it in a zustand store? Isn't that overkill?" My answer is
 * I thought it might be used to potentially store the whole session (all data about user), but I'm
 * still not sure if I should do that yet, so I'me leaving things as is for now
 */
const AppUserIdProvider = (props: React.PropsWithChildren) => {
  const { session } = useSession();
  if (!session) {
    throw new Error(
      "\
      Session is null while trying to access app user id \
      from sqlite-db/in-memory. This shouldn't happen!"
    );
  }
  const { subjectClaim } = session;
  const db = useSQLiteContext();
  const appUser = db.getFirstSync<{ id: number }>(
    `SELECT id FROM app_user WHERE aws_cognito_sub = ?;`,
    [subjectClaim]
  );
  if (!appUser) {
    throw new Error(
      "app_user_id doesn't exist when querying sqlite db! Big Problem!"
    );
  }
  const [store] = useState(() => createAppUserIdStore(appUser.id));
  return (
    <AppUserIdStoreContext.Provider value={store}>
      {props.children}
    </AppUserIdStoreContext.Provider>
  );
};

const useAppUserIdStore = <T,>(selector: (state: AppUserIdState) => T) => {
  const appUserIdStore = useContext(AppUserIdStoreContext);
  if (!appUserIdStore) {
    throw new Error(
      "App User Id Store context is null! Make sure you're using this within an AppUserIdStore Provider in React Tree"
    );
  }
  return useStore(appUserIdStore, selector);
};

const useAppUserId = () => useAppUserIdStore((state) => state.appUserId);

export { AppUserIdProvider, useAppUserId };
