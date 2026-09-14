export function mapEmbedSrc(
  lat: number | null | undefined,
  lng: number | null | undefined,
  mapUrl: string
): string {
  if (mapUrl) return mapUrl;
  if (lat !== null && lat !== undefined && lng !== null && lng !== undefined) {
    return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  }
  return "";
}
