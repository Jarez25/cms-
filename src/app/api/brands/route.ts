import { getScope } from "@/lib/api-auth";
import { getProductBrands } from "@/lib/data";

export async function GET() {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  return Response.json(await getProductBrands(scope.providerId));
}
