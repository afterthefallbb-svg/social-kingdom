function lineAnchor(points, width) {
  let length = 0;
  const segments = points.slice(1).map((point, i) => {
    const previous = points[i], distance = Math.hypot(point[0] - previous[0], point[1] - previous[1]);
    length += distance;
    return { previous, point, distance };
  });
  if (length < width + 20) return null;
  let remaining = length / 2;
  for (const { previous, point, distance } of segments) {
    if (distance && remaining <= distance) {
      let angle = Math.atan2(point[1] - previous[1], point[0] - previous[0]);
      if (angle > Math.PI / 2) angle -= Math.PI;
      if (angle < -Math.PI / 2) angle += Math.PI;
      return { x: previous[0] + (point[0] - previous[0]) * remaining / distance,
        y: previous[1] + (point[1] - previous[1]) * remaining / distance, angle };
    }
    remaining -= distance;
  }
  return null;
}
export function paintLabels(ctx, features, zoom, palette, size) {
  const occupied = [], named = new Set();
  const candidates = features.filter((f) => /City|Admin|Neighborhood|\/label$|Water point|Sport place/.test(f.layer));
  candidates.sort((a, b) => Number(!/City|Admin/.test(a.layer)) - Number(!/City|Admin/.test(b.layer)));
  for (const feature of candidates) {
    const p = feature.properties, name = p._name_en || p._name_global || p._name_local || p._name;
    if (typeof name !== 'string' || !name.trim() || named.has(name)) continue;
    const road = /^Road/.test(feature.layer), city = /City|Admin/.test(feature.layer);
    if ((!city && !road && zoom < 11) || (road && zoom < 10)) continue;
    const fontSize = city ? 12 : road ? 9.5 : 10;
    ctx.font = `${city ? 600 : 400} ${fontSize}px system-ui, sans-serif`;
    const width = ctx.measureText(name).width;
    const points = feature.points.reduce((best, path) => path.length > best.length ? path : best, []);
    if (!points.length) continue;
    const anchor = feature.type === 1 ? { x: points[0][0], y: points[0][1], angle: 0 } : lineAnchor(points, width);
    if (!anchor) continue;
    const { x, y, angle } = anchor;
    const halfWidth = Math.abs(Math.cos(angle)) * width / 2 + Math.abs(Math.sin(angle)) * fontSize;
    const halfHeight = Math.abs(Math.sin(angle)) * width / 2 + Math.abs(Math.cos(angle)) * fontSize;
    const box = [x - halfWidth - 5, y - halfHeight - 4, x + halfWidth + 5, y + halfHeight + 4];
    // Do not clip a name at a tile edge or overlap another label.
    if (box[0] < 0 || box[1] < 0 || box[2] > size || box[3] > size) continue;
    if (occupied.some((b) => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) continue;
    occupied.push(box); named.add(name);
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = 3; ctx.strokeStyle = palette.midnight; ctx.strokeText(name, 0, 0);
    ctx.fillStyle = city ? palette.text : /Water/.test(feature.layer) ? palette.ice : palette.muted;
    ctx.fillText(name, 0, 0); ctx.restore();
  }
}