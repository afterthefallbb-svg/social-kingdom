// Canvas colors come from the same semantic tokens as the map controls.
export function readMapPalette(element) {
  const style = getComputedStyle(element);
  return Object.fromEntries(Object.entries({
    midnight: 'midnight', deepBlue: 'deep-blue', royal: 'royal',
    electric: 'electric', ice: 'ice', cyan: 'cyan', gold: 'gold',
    champagne: 'champagne', darkGold: 'dark-gold', text: 'text',
    muted: 'muted', forest: 'forest', park: 'park',
    building: 'building', urban: 'urban', water: 'water',
  }).map(([key, token]) => [key, style.getPropertyValue(`--map-${token}`).trim()]));
}