import { notFound } from "next/navigation";
import {
  isWorkspaceSection,
  WorkspaceShell,
} from "@/features/workspace/workspace-shell";

const titles = {
  dashboard: "Обзор",
  transactions: "Транзакции",
  statistics: "Статистика",
  categories: "Категории",
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isWorkspaceSection(section)) notFound();
  return (
    <WorkspaceShell section={section}>
      <h1>{titles[section]}</h1>
      <div className="workspace-empty">
        <p>Раздел находится в разработке.</p>
      </div>
    </WorkspaceShell>
  );
}
