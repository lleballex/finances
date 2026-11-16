"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/ui";
import { API_URL, getSession } from "./session";

export function WelcomeAuth() {
  const [error, setError] = useState(false);
  useEffect(() => {
    getSession()
      .then((user) => {
        if (user) window.location.replace("/dashboard");
      })
      .catch(() => setError(true));
  }, []);
  return (
    <div className="welcome-auth">
      <Button
        className="welcome-login"
        onClick={() => {
          window.location.replace(`${API_URL}/auth/yandex`);
        }}
      >
        <span className="welcome-ya" aria-hidden="true">
          Я
        </span>
        Войти через Яндекс ID <span aria-hidden="true">↗</span>
      </Button>
      {error && <span>Сервер авторизации недоступен</span>}
    </div>
  );
}
