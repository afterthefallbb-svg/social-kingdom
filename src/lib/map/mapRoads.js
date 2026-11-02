// Three inexpensive strokes provide illumination without blurring every road.
export function paintRoads(ctx, features, zoom, palette) {
  const scale = Math.pow(1.42, Math.max(0, zoom - 13));
  const groups = new Map();
  for (const feature of features) {
    const symbol = Number(feature.properties._symbol ?? 7);
    if ((symbol >= 8 && zoom < 15) || feature.properties.Viz === 3) continue;
    if (!groups.has(symbol)) groups.set(symbol, new Path2D());
    groups.get(symbol).addPath(feature.path);
  }
  // Local streets first, then arterials, highways, and motorway gold accents.
  for (const symbol of [...groups.keys()].sort((a, b) => b - a)) {
    const path = groups.get(symbol), motorway = symbol === 0;
    const major = symbol <= 4, minor = symbol === 5 || symbol === 6;
    const width = (motorway ? 2.8 : major ? 2.2 : minor ? 1.35 : 0.85) * scale;
    const color = motorway ? palette.gold : major ? palette.electric : palette.royal;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.globalAlpha = major ? 0.16 : 0.08;
    ctx.strokeStyle = motorway ? palette.gold : palette.electric;
    ctx.lineWidth = width + (major ? 5 : 2.2); ctx.stroke(path);
    ctx.globalAlpha = 0.55; ctx.strokeStyle = color;
    ctx.lineWidth = width + 1.1; ctx.stroke(path);
    ctx.globalAlpha = 1; ctx.lineWidth = width;
    ctx.strokeStyle = motorway ? palette.champagne : major ? palette.electric : minor ? palette.electric : palette.royal;
    ctx.stroke(path);
    if (major && !motorway) {
      ctx.globalAlpha = 0.65; ctx.lineWidth = Math.max(0.5, width * 0.28);
      ctx.strokeStyle = palette.ice; ctx.stroke(path);
    }
  }
  ctx.globalAlpha = 1;
}