import { useCallback, useEffect, useMemo, useState } from "react";
import { account } from "../config/appwrite";
import { ADMIN_LABEL, AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  // undefined = still checking, null = signed out
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    account
      .get()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const signIn = useCallback(async (email, password) => {
    await account.createEmailPasswordSession({ email, password });
    const me = await account.get();
    setUser(me);
    return me;
  }, []);

  const signOut = useCallback(async () => {
    await account.deleteSession({ sessionId: "current" }).catch(() => {});
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      checking: user === undefined,
      isAdmin: Boolean(user?.labels?.includes(ADMIN_LABEL)),
      signIn,
      signOut,
    }),
    [user, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
