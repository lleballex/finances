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
  const devLogin = process.env.NEXT_PUBLIC_DEV_LOGIN === "true";
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
      {devLogin && (
        <Button
          variant="secondary"
          className="welcome-dev-login"
          onClick={() => {
            window.location.replace(`${API_URL}/auth/dev-login`);
          }}
        >
          Войти в демо-режиме
        </Button>
      )}
      {error && <span>Сервер авторизации недоступен</span>}
    </div>
  );
}
