import { roadAccentPasses, roadGroup } from '@/lib/map/roadStyles';

export function paintRoads(ctx, features, zoom, palette) {
  const groups = new Map();
  for (const feature of features) {
    const group = roadGroup(feature.properties);
    if (!group) continue;
    if (!groups.has(group)) groups.set(group, new Path2D());
    groups.get(group).addPath(feature.path);
  }
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // Thin, unblurred accents preserve the daylight map and its street detail.
  for (const pass of roadAccentPasses(zoom, palette)) {
    const path = groups.get(pass.group);
    if (!path) continue;
    ctx.globalAlpha = pass.opacity;
    ctx.strokeStyle = pass.color;
    ctx.lineWidth = pass.width;
    ctx.stroke(path);
  }
  ctx.restore();
}