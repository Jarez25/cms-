import { getSession } from "./auth";

export type Scope = { providerId: number | null } | null;

export async function getScope(): Promise<Scope> {
  const session = await getSession();
  if (!session) return null;
  return { providerId: session.providerId };
}

export async function requireScope(): Promise<Scope> {
  return getScope();
}

export function ownsRow(row: { provider_id: number | null } | undefined, scope: Scope): boolean {
  if (!scope) return false;
  return (row?.provider_id ?? null) === scope.providerId;
}
