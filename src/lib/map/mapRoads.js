import { luxuryRoadPasses, roadGroup } from '@/lib/map/roadStyles';

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
  const transform = ctx.getTransform();
  const pixelRatio = Math.hypot(transform.a, transform.b);
  // Composite complete class paths, so intersections retain continuous metallic cores.
  for (const pass of luxuryRoadPasses(zoom, palette)) {
    const path = groups.get(pass.group);
    if (!path) continue;
    ctx.filter = pass.blur ? `blur(${pass.blur * pixelRatio}px)` : 'none';
    ctx.globalAlpha = pass.opacity;
    ctx.strokeStyle = pass.color;
    ctx.lineWidth = pass.width;
    ctx.stroke(path);
  }
  ctx.restore();
}