import { getProductsPaginated } from "@/lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  const providerId = provider ? Number(provider) : null;
  const page = Number(url.searchParams.get("page") || 1);
  const limit = Number(url.searchParams.get("limit") || 12);
  const q = url.searchParams.get("q") || "";
  const category = url.searchParams.get("category") || "";
  const brand = url.searchParams.get("brand") || "";
  const minRaw = url.searchParams.get("min");
  const maxRaw = url.searchParams.get("max");

  const result = await getProductsPaginated(providerId, {
    page,
    limit,
    q,
    category,
    brand,
    min: minRaw ? Number(minRaw) : undefined,
    max: maxRaw ? Number(maxRaw) : undefined,
  });
  return Response.json(result);
}
