"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMyNotifications, type MyNotification } from "@/lib/my-notifications";
import { useProfile } from "@/components/layout/ProfileContext";

interface NotiCtx {
  notifications: MyNotification[];
  unreadCount: number;
  isRead: (id: string) => boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const Ctx = createContext<NotiCtx>({
  notifications: [],
  unreadCount: 0,
  isRead: () => true,
  markRead: () => {},
  markAllRead: () => {},
});

const STORAGE_KEY = "merge-my-notis-read-v1";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { currentUserId } = useProfile();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const notifications = useMemo(() => getMyNotifications(currentUserId), [currentUserId]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setReadIds(new Set(JSON.parse(saved) as string[]));
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  const persist = (next: Set<string>) => {
    setReadIds(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  };

  const markRead = (id: string) => {
    if (readIds.has(id)) return;
    persist(new Set(readIds).add(id));
  };

  const markAllRead = () => {
    persist(new Set(notifications.map((n) => n.id)));
  };

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  return (
    <Ctx.Provider
      value={{
        notifications,
        unreadCount,
        isRead: (id) => readIds.has(id),
        markRead,
        markAllRead,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useNotifications() {
  return useContext(Ctx);
}
