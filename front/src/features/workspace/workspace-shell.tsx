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
}: {
  section: WorkspaceSection;
  children: ReactNode;
  user?: SessionUser;
  onLogout?: () => void;
}) {
  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <Link
          className="workspace-brand"
          href="/"
          aria-label="Могну Финансы — на главную"
        >
          <Image src="/logo.png" alt="" width={150} height={50} />
        </Link>
        <nav className="workspace-nav" aria-label="Основная навигация">
          {navigation.map(({ slug, label, icon: Icon }) => (
            <Link
              key={slug}
              href={user ? `/${slug}` : `/preview/${slug}`}
              aria-current={slug === section ? "page" : undefined}
            >
              <Icon size={19} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        {user ? (
          <div className="workspace-profile">
            <span>
              {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
                "Пользователь"}
            </span>
            <ActionMenu
              label="Меню пользователя"
              options={[{ value: "logout", label: "Выйти" }]}
              onAction={() => onLogout?.()}
            />
          </div>
        ) : (
          <div className="workspace-preview-label">Предпросмотр интерфейса</div>
        )}
      </aside>
      <main className="workspace-content">{children}</main>
    </div>
  );
}
