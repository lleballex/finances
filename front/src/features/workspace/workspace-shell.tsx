"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftRight,
  ChartNoAxesCombined,
  LayoutDashboard,
  Tags,
} from "lucide-react";
import type { ReactNode } from "react";
import { ActionMenu } from "@/shared/ui";
import type { SessionUser } from "@/features/auth/session";
import type { WorkspaceSection } from "./sections";
import "./workspace.css";

const navigation = [
  { slug: "dashboard", label: "Обзор", icon: LayoutDashboard },
  { slug: "transactions", label: "Транзакции", icon: ArrowLeftRight },
  { slug: "statistics", label: "Статистика", icon: ChartNoAxesCombined },
  { slug: "categories", label: "Категории", icon: Tags },
] as const;

export function WorkspaceShell({
  section,
  children,
  user,
  onLogout,
  preview = false,
}: {
  section?: WorkspaceSection;
  children: ReactNode;
  user?: SessionUser | null;
  onLogout?: () => void;
  preview?: boolean;
}) {
  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <Link
          className="workspace-brand"
          href="/"
          aria-label="Могну Финансы — на главную"
        >
          <span className="workspace-brand-logo">
            <Image src="/logo.png" alt="" width={680} height={225} />
          </span>
        </Link>
        <nav className="workspace-nav" aria-label="Основная навигация">
          {navigation.map(({ slug, label, icon: Icon }) => (
            <Link
              key={slug}
              href={preview ? `/preview/${slug}` : `/${slug}`}
              aria-current={slug === section ? "page" : undefined}
            >
              <span className="workspace-nav-icon">
                <Icon size={14} aria-hidden="true" />
              </span>
              {label}
            </Link>
          ))}
        </nav>
        {user ? (
          <div className="workspace-profile">
            <span className="workspace-avatar" aria-hidden="true">
              {[user.firstName, user.lastName]
                .filter(Boolean)
                .map((name) => name?.trim().charAt(0).toLocaleUpperCase("ru"))
                .join("") || "П"}
            </span>
            <span className="workspace-profile-name">
              {user.firstName || user.lastName || "Пользователь"}
            </span>
            <ActionMenu
              label="Меню пользователя"
              options={[{ value: "logout", label: "Выйти" }]}
              onAction={() => onLogout?.()}
            />
          </div>
        ) : preview ? (
          <div className="workspace-preview-label">Предпросмотр интерфейса</div>
        ) : null}
      </aside>
      <main className="workspace-content">{children}</main>
    </div>
  );
}
