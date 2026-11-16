"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/features/workspace/workspace-shell";
import type { WorkspaceSection } from "@/features/workspace/sections";
import { API_URL, getSession, type SessionUser } from "./session";

const titles = {
  dashboard: "Обзор",
  transactions: "Транзакции",
  statistics: "Статистика",
  categories: "Категории",
};

export function ProtectedWorkspace({ section }: { section: WorkspaceSection }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    getSession()
      .then((session) => {
        if (session) setUser(session);
        else window.location.replace("/");
      })
      .catch(() => setError(true));
  }, []);
  if (error)
    return <p>Сервер авторизации недоступен. Попробуйте обновить страницу.</p>;
  if (!user) return <p>Загрузка…</p>;
  const logout = async () => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (response.ok) window.location.replace("/");
    else setError(true);
  };
  return (
    <WorkspaceShell section={section} user={user} onLogout={logout}>
      <h1>{titles[section]}</h1>
      <div className="workspace-empty">
        <p>Раздел находится в разработке.</p>
      </div>
    </WorkspaceShell>
  );
}
