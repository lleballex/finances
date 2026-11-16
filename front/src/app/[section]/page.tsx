import { notFound } from "next/navigation";
import { ProtectedWorkspace } from "@/features/auth/protected-workspace";
import { isWorkspaceSection } from "@/features/workspace/workspace-shell";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isWorkspaceSection(section)) notFound();
  return <ProtectedWorkspace section={section} />;
}
