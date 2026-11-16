import { notFound } from "next/navigation";
import { isWorkspaceSection } from "@/features/workspace/sections";

const titles = {
  dashboard: "Обзор",
  transactions: "Транзакции",
  statistics: "Статистика",
  categories: "Категории",
};

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isWorkspaceSection(section)) notFound();
  return (
    <>
      <h1>{titles[section]}</h1>
      <div className="workspace-empty">
        <p>Раздел находится в разработке.</p>
      </div>
    </>
  );
}
