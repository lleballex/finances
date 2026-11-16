export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api/v1";

export type SessionUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

export async function getSession(): Promise<SessionUser | null> {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: "include",
    cache: "no-store",
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Сервер авторизации недоступен");
  return response.json() as Promise<SessionUser>;
}
