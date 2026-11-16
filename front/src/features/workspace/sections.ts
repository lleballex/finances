export const workspaceSections = [
  "dashboard",
  "transactions",
  "statistics",
  "categories",
] as const;

export type WorkspaceSection = (typeof workspaceSections)[number];

export function isWorkspaceSection(value: string): value is WorkspaceSection {
  return workspaceSections.some((section) => section === value);
}
