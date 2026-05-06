import type { SelectSession, SelectUser } from "~/types/auth.ts";

import { createContext, type JSX, useContext } from "solid-js";

export type SessionContextValue = {
  user: SelectUser;
  session: SelectSession;
};

const SessionContext = createContext<SessionContextValue>();

export function SessionProvider(props: {
  user: SelectUser;
  session: SelectSession;
  children: JSX.Element;
}): JSX.Element {
  return (
    <SessionContext.Provider
      value={{
        get user() {
          return props.user;
        },
        get session() {
          return props.session;
        },
      }}
    >
      {props.children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}
