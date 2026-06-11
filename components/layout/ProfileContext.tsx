"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { mockEmployees } from "@/lib/mock-employees";

// "ฉัน" = พนักงานที่ login จริง (mock จนกว่าจะต่อ auth)
const CURRENT_USER_ID = "emp-9";
const me = mockEmployees.find((e) => e.id === CURRENT_USER_ID)!;

interface ProfileCtx {
  currentUserId: string;
  name: string;
  role: string;
  initials: string;
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
}

const STORAGE_KEY = "merge-hr-profile-avatar";

const Ctx = createContext<ProfileCtx>({
  currentUserId: CURRENT_USER_ID,
  name: me.fullName, role: me.positionName, initials: me.avatarInitials,
  avatarUrl: null, setAvatarUrl: () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [avatarUrl, setAvatarUrlState] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setAvatarUrlState(saved);
  }, []);

  const setAvatarUrl = (url: string | null) => {
    setAvatarUrlState(url);
    if (url) localStorage.setItem(STORAGE_KEY, url);
    else localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <Ctx.Provider value={{ currentUserId: CURRENT_USER_ID, name: me.fullName, role: me.positionName, initials: me.avatarInitials, avatarUrl, setAvatarUrl }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProfile() {
  return useContext(Ctx);
}
