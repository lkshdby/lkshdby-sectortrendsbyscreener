/**
 * Deterministic color generator for 188+ industry sectors
 * Uses Golden Angle (137.508 degrees) distribution across HSL space
 * for maximum visual distinctness and high contrast.
 */

// Cache of assigned colors to maintain stability
const colorCache = new Map<string, string>();

export function getSectorColor(sectorName: string, index = 0): string {
  if (colorCache.has(sectorName)) {
    return colorCache.get(sectorName)!;
  }

  // Golden angle approximation in degrees
  const goldenAngle = 137.508;
  const hue = (index * goldenAngle) % 360;
  
  // Vary lightness and saturation slightly across chunks to maximize contrast
  const saturation = 70 + ((index % 5) * 5); // 70% to 90%
  const lightness = 42 + ((index % 4) * 6);   // 42% to 60%

  const color = `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
  colorCache.set(sectorName, color);
  return color;
}

export function generateSectorPalette(sectors: string[]): Record<string, string> {
  const palette: Record<string, string> = {};
  sectors.forEach((sec, idx) => {
    palette[sec] = getSectorColor(sec, idx);
  });
  return palette;
}
