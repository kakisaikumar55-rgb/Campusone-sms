import { useCallback, useEffect, useState } from "react";

const KEY = "sms.auth.user";

export interface AuthUser {
  name: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(KEY);
    setUser(raw ? (JSON.parse(raw) as AuthUser) : null);
    setReady(true);
  }, []);

  const login = useCallback((email: string) => {
    const nextUser: AuthUser = {
      name: email.split("@")[0]?.replace(/[._]/g, " ") || "Administrator",
      email,
      role: "Administrator",
    };
    window.localStorage.setItem(KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(KEY);
    setUser(null);
  }, []);

  return { user, ready, login, logout };
}
