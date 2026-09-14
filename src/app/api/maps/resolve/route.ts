import { getScope } from "@/lib/api-auth";

function extractCoords(url: string): { lat: number; lng: number } | null {
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /[!]3d(-?\d+\.\d+)[!]4d(-?\d+\.\d+)/,
    /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return { lat: Number(m[1]), lng: Number(m[2]) };
  }
  return null;
}

export async function GET(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });

  const url = new URL(request.url).searchParams.get("url") || "";
  if (!/^https?:\/\//.test(url)) {
    return Response.json({ error: "URL inválida" }, { status: 400 });
  }

  try {
    const res = await fetch(url, { redirect: "follow" });
    const finalUrl = res.url || url;

    const coords = extractCoords(finalUrl);
    if (!coords) {
      return Response.json(
        { error: "No se pudieron extraer coordenadas de ese enlace" },
        { status: 422 }
      );
    }

    return Response.json({
      lat: coords.lat,
      lng: coords.lng,
      finalUrl,
      embedUrl: `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`,
    });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 422 });
  }
}
