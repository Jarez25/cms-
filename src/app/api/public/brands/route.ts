import { getProductBrands } from "@/lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  const providerId = provider ? Number(provider) : null;
  return Response.json(await getProductBrands(providerId));
}
