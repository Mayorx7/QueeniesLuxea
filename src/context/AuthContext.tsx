import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type UserRole = "customer" | "vendor" | "admin";
export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (currentUser: User | null) => {
    if (!supabase || !currentUser) {
      setProfile(null);
      return null;
    }
    const { data } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, role, created_at")
      .eq("id", currentUser.id)
      .maybeSingle();
    const nextProfile = data as Profile | null;
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const refreshProfile = useCallback(async () => { await loadProfile(user); }, [loadProfile, user]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      setUser(session?.user ?? null);
      await loadProfile(session?.user ?? null);
      if (active) setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      void loadProfile(session?.user ?? null).finally(() => setLoading(false));
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  return <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
