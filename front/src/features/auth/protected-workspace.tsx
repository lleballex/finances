"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { WorkspaceShell } from "@/features/workspace/workspace-shell";
import { isWorkspaceSection } from "@/features/workspace/sections";
import { API_URL, getSession, type SessionUser } from "./session";

export function ProtectedWorkspace({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentSection = pathname.split("/")[1];
  const section = isWorkspaceSection(currentSection)
    ? currentSection
    : undefined;
  const [user, setUser] = useState<SessionUser | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getSession()
      .then((session) => {
        if (!active) return;
        if (session) setUser(session);
        else window.location.replace("/");
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error();
      window.location.replace("/");
    } catch {
      setError(true);
    }
  };

  return (
    <WorkspaceShell section={section} user={user} onLogout={logout}>
      {error ? (
        <div className="workspace-empty">
          <p>Сервер авторизации недоступен. Попробуйте обновить страницу.</p>
        </div>
      ) : user ? (
        children
      ) : (
        <div
          className="workspace-loading"
          role="status"
          aria-label="Проверка сессии"
        >
          <LoaderCircle
            className="workspace-spinner"
            size={32}
            aria-hidden="true"
          />
        </div>
      )}
    </WorkspaceShell>
  );
}
