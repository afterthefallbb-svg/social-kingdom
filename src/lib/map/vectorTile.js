// Decode the standard Mapbox Vector Tile format used by ArcGIS basemaps.
const utf8 = new TextDecoder();
function reader(bytes) {
  return { bytes, pos: 0, number() {
    let value = 0, multiplier = 1, byte;
    do { byte = this.bytes[this.pos++]; value += (byte & 127) * multiplier; multiplier *= 128; } while (byte & 128);
    return value;
  } };
}
function fields(bytes, visit) {
  const r = reader(bytes);
  while (r.pos < bytes.length) {
    const tag = r.number(), wire = tag & 7;
    let value;
    if (wire === 0) value = r.number();
    else if (wire === 2) { const length = r.number(); value = bytes.subarray(r.pos, r.pos + length); r.pos += length; }
    else if (wire === 1 || wire === 5) { const length = wire === 1 ? 8 : 4; value = bytes.subarray(r.pos, r.pos + length); r.pos += length; }
    else throw new Error('Unsupported geographic tile encoding');
    visit(tag >> 3, value, wire);
  }
}
function packed(bytes) {
  const r = reader(bytes), values = [];
  while (r.pos < bytes.length) values.push(r.number());
  return values;
}
const signed = (value) => value % 2 ? -(value + 1) / 2 : value / 2;
function propertyValue(bytes) {
  let result = 0;
  fields(bytes, (field, value) => {
    if (field === 1) result = utf8.decode(value);
    else if (field === 2 || field === 3) {
      const view = new DataView(value.buffer, value.byteOffset, value.byteLength);
      result = field === 2 ? view.getFloat32(0, true) : view.getFloat64(0, true);
    } else result = field === 6 ? signed(value) : field === 7 ? Boolean(value) : value;
  });
  return result;
}
function geometry(bytes) {
  const r = reader(bytes), paths = [];
  let x = 0, y = 0, path;
  while (r.pos < bytes.length) {
    const command = r.number(), id = command & 7, count = Math.floor(command / 8);
    if (id === 7) { if (path?.length) path.push(path[0]); continue; }
    if (id !== 1 && id !== 2) throw new Error('Unsupported geographic geometry');
    for (let i = 0; i < count; i++) {
      x += signed(r.number()); y += signed(r.number());
      if (id === 1) { path = []; paths.push(path); }
      path.push([x, y]);
    }
  }
  return paths;
}
function feature(bytes, keys, values) {
  let type = 0, tags = [], shape;
  fields(bytes, (field, value) => {
    if (field === 2) tags = packed(value);
    if (field === 3) type = value;
    if (field === 4) shape = value;
  });
  const properties = {};
  for (let i = 0; i < tags.length; i += 2) properties[keys[tags[i]]] = values[tags[i + 1]];
  return { type, properties, paths: shape ? geometry(shape) : [] };
}
function layer(bytes) {
  let name = '', extent = 4096;
  const keys = [], values = [], features = [];
  fields(bytes, (field, value) => {
    if (field === 1) name = utf8.decode(value);
    if (field === 2) features.push(value);
    if (field === 3) keys.push(utf8.decode(value));
    if (field === 4) values.push(propertyValue(value));
    if (field === 5) extent = value;
  });
  return { name, extent, features: features.map((bytes) => feature(bytes, keys, values)) };
}
export function decodeVectorTile(buffer) {
  const layers = [];
  fields(new Uint8Array(buffer), (field, value) => { if (field === 3) layers.push(layer(value)); });
  return layers;
}