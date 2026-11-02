import { paintRoads } from '@/lib/map/mapRoads';
import { paintLabels } from '@/lib/map/mapLabels';

function visible(properties, zoom) {
  const level = (n) => n > 24 ? n / 10 : n;
  return (!properties._minzoom || level(properties._minzoom) <= zoom) &&
    (!properties._maxzoom || level(properties._maxzoom) > zoom);
}
function project(source, coords, size) {
  const overzoom = 2 ** (coords.z - source.z);
  const offsetX = (coords.x - source.x * overzoom) * size;
  const offsetY = (coords.y - source.y * overzoom) * size;
  return source.layers.flatMap((layer) => {
    const scale = size * overzoom / layer.extent;
    return layer.features.filter((feature) => visible(feature.properties, coords.z)).map((feature) => {
      const path = new Path2D();
      const points = feature.paths.map((ring) => ring.map(([x, y]) => [x * scale - offsetX, y * scale - offsetY]));
      for (const ring of points) {
        ring.forEach(([x, y], i) => i ? path.lineTo(x, y) : path.moveTo(x, y));
        if (feature.type === 3) path.closePath();
      }
      return { ...feature, layer: layer.name, path, points };
    });
  });
}
function surface(name, palette) {
  if (name === 'Land') return palette.midnight;
  if (/Marine area|Bathymetry|^Water area/.test(name)) return palette.water;
  if (/Vegetation|forest|Indigenous/.test(name)) return palette.forest;
  if (/Park or farming|Golf course|Zoo|Cemetery/.test(name)) return palette.park;
  if (name === 'Special area of interest') return palette.forest;
  if (name === 'Building') return palette.building;
  if (/Urban area|Military|Retail|Government|Education|Medical|Industry|Transportation|Airport|Port|Freight|Landmark|Finance|Emergency|Pedestrian/.test(name)) return palette.urban;
  return null;
}
function paintLand(ctx, features, palette) {
  const rank = (name) => name === 'Land' ? 0 : /Urban/.test(name) ? 1 : /Water|Marine|Bathymetry/.test(name) ? 3 : name === 'Building' ? 4 : 2;
  const polygons = features.filter((f) => f.type === 3 && !f.layer.endsWith('/label'));
  polygons.sort((a, b) => rank(a.layer) - rank(b.layer));
  for (const feature of polygons) {
    const color = surface(feature.layer, palette);
    if (!color) continue;
    ctx.fillStyle = color; ctx.fill(feature.path, 'evenodd');
    if (/^Water area$|Building|Park or farming|Golf course/.test(feature.layer)) {
      ctx.strokeStyle = feature.layer === 'Building' ? palette.royal : feature.layer === 'Water area' ? palette.electric : palette.cyan;
      ctx.globalAlpha = feature.layer === 'Building' ? 0.2 : 0.16;
      ctx.lineWidth = 0.6; ctx.stroke(feature.path); ctx.globalAlpha = 1;
    }
  }
}
function paintWaterways(ctx, features, palette) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const feature of features.filter((f) => f.type === 2 && /^Water line/.test(f.layer) && !f.layer.endsWith('/label'))) {
    ctx.strokeStyle = palette.royal; ctx.globalAlpha = 0.5; ctx.lineWidth = 3; ctx.stroke(feature.path);
    ctx.strokeStyle = palette.water; ctx.globalAlpha = 1; ctx.lineWidth = 1.8; ctx.stroke(feature.path);
  }
  ctx.globalAlpha = 0.35; ctx.strokeStyle = palette.muted; ctx.lineWidth = 0.7; ctx.setLineDash([3, 4]);
  for (const f of features.filter((f) => f.type === 2 && /Railroad|Boundary/.test(f.layer))) ctx.stroke(f.path);
  ctx.setLineDash([]); ctx.globalAlpha = 1;
}
export function paintGeography(canvas, source, coords, palette) {
  const size = 256, ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = size * ratio; canvas.height = size * ratio;
  canvas.style.width = `${size}px`; canvas.style.height = `${size}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio); ctx.fillStyle = palette.deepBlue; ctx.fillRect(0, 0, size, size);
  const features = project(source, coords, size);
  paintLand(ctx, features, palette); paintWaterways(ctx, features, palette);
  for (const layer of ['Road tunnel', 'Road', 'Road bridge']) {
    paintRoads(ctx, features.filter((f) => f.type === 2 && f.layer === layer), coords.z, palette);
  }
  paintLabels(ctx, features, coords.z, palette, size);
}